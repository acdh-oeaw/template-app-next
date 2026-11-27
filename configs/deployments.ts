import type { DeployEnv } from "#/lib/env/deploy.ts";

/** Can use Helm templates in strings, like `{{ .Values.name }}`. */
export interface KubernetesResource {
	apiVersion: string;
	kind: string;
	metadata: { name: string; labels?: Record<string, string>; annotations?: Record<string, string> };
	[key: string]: unknown;
}

interface ResourceQuantities {
	cpu?: string;
	memory?: string;
}

/** Values of the chart in `.github/actions/deploy/chart/`, whose schema has the details. */
export interface Deployment {
	/** Names and labels the Kubernetes resources, so that they can be found and removed together. */
	name: string;
	/** Must exist in the cluster. */
	namespace: string;
	/** More than one needs `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, and a shared store for rate limiting. */
	replicas?: number;
	/** Merged with the defaults of the chart. */
	resources?: { requests?: ResourceQuantities; limits?: ResourceQuantities };
	ingress: {
		/** `restricted` when GitHub cannot reach the app, like behind a login, so deploying does not check its url. */
		access: "public" | "restricted";
		/** Only `traefik-proxy-protocol` forwards the addresses of clients, which rate limiting by address needs. */
		className: "traefik" | "traefik-proxy-protocol";
		/** Take precedence over the annotations of the chart. */
		annotations?: Record<string, string>;
		/** `upstream` for domains whose tls is terminated before the cluster, by the computing center of the ÖAW. */
		tls:
			| {
					terminatedBy: "cluster";
					certIssuer: "acdh-prod" | "letsencrypt-prod";
					/** Hosts that redirect to the host of the base url, like `www.example.at` for `https://example.at`. */
					redirectHosts?: Array<string>;
			  }
			| { terminatedBy: "upstream" };
	};
	/** Other resources, like a cronjob. They get the labels of the app, but can set their own `app.kubernetes.io/name`. */
	extraResources?: Array<KubernetesResource>;
	/** Variables that differ between deployments, and are not secret. Others are set in GitHub. */
	env: DeployEnv;
}

/** By GitHub environment. `bun test` checks that deployments do not share a host or resources. */
export const deployments = {
	production: {
		name: "frontend",
		namespace: "template-app-next",
		ingress: {
			access: "public",
			className: "traefik-proxy-protocol",
			tls: { terminatedBy: "cluster", certIssuer: "acdh-prod" },
		},
		env: {
			NEXT_PUBLIC_APP_BASE_URL: "https://template-app-next.acdh-dev.oeaw.ac.at",
			TRUSTED_PROXY_COUNT: "1",
		},
	},
	/** Not in the namespace of production, so that nothing that cleans up here can affect it. */
	development: {
		name: "frontend-development",
		namespace: "template-app-next-development",
		ingress: {
			access: "public",
			className: "traefik-proxy-protocol",
			tls: { terminatedBy: "cluster", certIssuer: "acdh-prod" },
		},
		env: {
			NEXT_PUBLIC_APP_BASE_URL: "https://template-app-next-development.acdh-dev.oeaw.ac.at",
			TRUSTED_PROXY_COUNT: "1",
			TYPESENSE_COLLECTION: "template-app-next-development",
		},
	},
} satisfies Record<string, Deployment>;

/** Without `image`, `env` and `managedBy`, which the deploy action sets. */
export type ChartValues = Omit<Deployment, "env"> & { serviceId: string; baseUrl: string };

export function getChartValues({ env, ...deployment }: Deployment, serviceId: string): ChartValues {
	return { ...deployment, serviceId, baseUrl: env.NEXT_PUBLIC_APP_BASE_URL };
}
