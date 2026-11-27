import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { type Deployment, deployments, getChartValues } from "#/configs/deployments.ts";
import { fromRoot } from "#/configs/paths.ts";

const all: Array<Deployment> = Object.values(deployments);

function getDuplicates(values: Array<string>): Array<string> {
	return values.filter((value, index) => values.indexOf(value) !== index);
}

function getRedirectHosts({ ingress }: Deployment): Array<string> {
	return ingress.tls.terminatedBy === "cluster" ? (ingress.tls.redirectHosts ?? []) : [];
}

test("deployments have different hosts", () => {
	const hosts = all.flatMap((deployment) => [
		new URL(deployment.env.NEXT_PUBLIC_APP_BASE_URL).host,
		...getRedirectHosts(deployment),
	]);

	expect(getDuplicates(hosts)).toStrictEqual([]);
});

/** Also in different namespaces, so that moving them into one is safe. */
test("deployments have different names", () => {
	expect(getDuplicates(all.map(({ name }) => name))).toStrictEqual([]);
});

interface Resource {
	apiVersion: string;
	kind: string;
	metadata: { name: string; labels?: Record<string, string>; annotations?: Record<string, string> };
	spec?: Record<string, unknown>;
	data?: Record<string, string>;
}

const directory = mkdtempSync(join(tmpdir(), "chart-"));
let count = 0;

/** Throws with the message of Helm, like for values that do not match the schema. */
function render(values: object, env?: Record<string, string>): Array<Resource> {
	const file = join(directory, `values-${String(count++)}.json`);
	writeFileSync(file, JSON.stringify({ ...values, env: env ?? { SERVICE_ID: "1" } }));

	const result = Bun.spawnSync([
		"helm",
		"template",
		"app",
		fromRoot(".github/actions/deploy/chart"),
		"--values",
		file,
		"--set-string",
		"image=ghcr.io/acdh-oeaw/app@sha256:0,managedBy=deploy-action",
	]);

	if (!result.success) {
		throw new Error(result.stderr.toString());
	}

	return (Bun.YAML.parse(result.stdout.toString()) as Array<Resource | null>).filter((resource) => resource != null);
}

function find(resources: Array<Resource>, kind: string): Resource {
	const resource = resources.find((resource) => resource.kind === kind);

	if (resource == null) {
		throw new Error(`No ${kind}`);
	}

	return resource;
}

const base = getChartValues(deployments.production, "1");

/** In CI, the workflow installs Helm, so a missing Helm fails there. */
describe.skipIf(Bun.which("helm") == null && process.env.CI == null)("chart", () => {
	test.each(Object.keys(deployments) as Array<keyof typeof deployments>)("renders %s", (key) => {
		const deployment: Deployment = deployments[key];
		const resources = render(getChartValues(deployment, "1"));

		for (const { metadata } of resources) {
			expect(metadata.labels).toMatchObject({
				"app.kubernetes.io/instance": deployment.name,
				"app.kubernetes.io/managed-by": "deploy-action",
			});
		}
	});

	test("names the secret after its values", () => {
		const [first, second] = [render(base, { A: "1" }), render(base, { A: "2" })].map((resources) => {
			const secret = find(resources, "Secret");
			const deployment = JSON.stringify(find(resources, "Deployment"));

			expect(deployment).toContain(`"name":"${secret.metadata.name}"`);

			return secret.metadata.name;
		});

		expect(first).not.toBe(second);
	});

	test("terminates tls in the cluster", () => {
		const ingress = find(render(base), "Ingress");

		expect(ingress.metadata.annotations).toMatchObject({
			"cert-manager.io/cluster-issuer": "acdh-prod",
			"traefik.ingress.kubernetes.io/router.middlewares": expect.stringContaining("redirect-https") as string,
		});
		expect(ingress.spec).toHaveProperty("tls");
	});

	test("does not redirect to https when tls is terminated upstream", () => {
		const ingress = find(
			render({ ...base, ingress: { ...base.ingress, tls: { terminatedBy: "upstream" } } }),
			"Ingress",
		);

		expect(ingress.metadata.annotations).toStrictEqual({
			"traefik.ingress.kubernetes.io/router.middlewares": "kube-system-compress@kubernetescrd",
		});
		expect(ingress.spec).not.toHaveProperty("tls");
	});

	test("lets annotations of the app take precedence", () => {
		const annotations = { "traefik.ingress.kubernetes.io/router.middlewares": "a" };
		const ingress = find(render({ ...base, ingress: { ...base.ingress, annotations } }), "Ingress");

		expect(ingress.metadata.annotations).toMatchObject(annotations);
	});

	test("redirects other hosts to the host of the base url", () => {
		const tls = { terminatedBy: "cluster", certIssuer: "letsencrypt-prod", redirectHosts: ["www.example.at"] };
		const resources = render({ ...base, baseUrl: "https://example.at", ingress: { ...base.ingress, tls } });

		expect(find(resources, "Gateway").spec).toMatchObject({
			listeners: [
				{ name: "http-www-example-at", hostname: "www.example.at", protocol: "HTTP" },
				{ name: "https-www-example-at", hostname: "www.example.at", protocol: "HTTPS" },
			],
		});
		expect(find(resources, "HTTPRoute").spec).toMatchObject({
			hostnames: ["www.example.at"],
			rules: [{ filters: [{ requestRedirect: { hostname: "example.at", statusCode: 301 } }] }],
		});
	});

	test("rejects redirect hosts when tls is terminated upstream", () => {
		const tls = { terminatedBy: "upstream", redirectHosts: ["www.example.at"] };

		expect(() => render({ ...base, ingress: { ...base.ingress, tls } })).toThrow(/redirectHosts/);
	});

	test("rejects invalid redirect hosts", () => {
		const tls = { terminatedBy: "cluster", certIssuer: "acdh-prod", redirectHosts: ["https://www.example.at"] };

		expect(() => render({ ...base, ingress: { ...base.ingress, tls } })).toThrow(/redirectHosts/);
	});

	test("rejects names that are too long for the names derived from them", () => {
		expect(() => render({ ...base, name: "a".repeat(41) })).toThrow(/name/);
	});

	test("adds the labels of the app to extra resources", () => {
		const cronJob = {
			apiVersion: "batch/v1",
			kind: "CronJob",
			metadata: { name: "{{ .Values.name }}-index", labels: { "app.kubernetes.io/name": "index" } },
			spec: { schedule: "0 3 * * *" },
		};
		const resource = find(render({ ...base, extraResources: [cronJob] }), "CronJob");

		expect(resource.metadata).toStrictEqual({
			name: "frontend-index",
			labels: {
				"app.kubernetes.io/name": "index",
				"app.kubernetes.io/instance": "frontend",
				"app.kubernetes.io/managed-by": "deploy-action",
				ID: "1",
			},
		});
	});
});
