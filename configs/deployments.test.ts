import { expect, test } from "bun:test";

import { type Deployment, deployments } from "#/configs/deployments.ts";

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

/** Without a scheme, port or path, and in lowercase, like the host of a url. */
test.each(all.flatMap(getRedirectHosts))("%s is a valid redirect host", (host) => {
	expect(host).toMatch(/^(?:[a-z0-9](?:[-a-z0-9]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/);
});

/** Also in different namespaces, so that moving them into one is safe. */
test("deployments have different names", () => {
	expect(getDuplicates(all.map(({ name }) => name))).toStrictEqual([]);
});

/** Labels are limited to 63 characters, and the name of the secret adds a suffix. */
test.each(all.map(({ name }) => name))("%s is a valid resource name", (name) => {
	expect(name).toMatch(/^[a-z](?:[-a-z0-9]{0,38}[a-z0-9])?$/);
});
