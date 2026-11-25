import type { DeployEnv } from "#/lib/env/deploy.ts";

export interface Deployment {
	/** Names and labels the Kubernetes resources, so that they can be found and removed together. */
	name: string;
	/** Must exist in the cluster. */
	namespace: string;
	ingress: {
		/** Only `traefik-proxy-protocol` forwards the addresses of clients, which rate limiting by address needs. */
		className: "traefik" | "traefik-proxy-protocol";
		/** `upstream` for domains whose tls is terminated before the cluster, by the computing center of the ÖAW. */
		tls: { terminatedBy: "cluster"; certIssuer: "acdh-prod" | "letsencrypt-prod" } | { terminatedBy: "upstream" };
	};
	/** Variables that differ between deployments, and are not secret. Others are set in GitHub. */
	env: DeployEnv;
}

/** By GitHub environment. `bun test` checks that deployments do not share a host or resources. */
export const deployments = {
	production: {
		name: "frontend",
		namespace: "template-app-next",
		ingress: { className: "traefik-proxy-protocol", tls: { terminatedBy: "cluster", certIssuer: "acdh-prod" } },
		env: {
			NEXT_PUBLIC_APP_BASE_URL: "https://template-app-next.acdh-dev.oeaw.ac.at",
			TRUSTED_PROXY_COUNT: "1",
		},
	},
	/** Not in the namespace of production, so that nothing that cleans up here can affect it. */
	development: {
		name: "frontend-development",
		namespace: "template-app-next-development",
		ingress: { className: "traefik-proxy-protocol", tls: { terminatedBy: "cluster", certIssuer: "acdh-prod" } },
		env: {
			NEXT_PUBLIC_APP_BASE_URL: "https://template-app-next-development.acdh-dev.oeaw.ac.at",
			TRUSTED_PROXY_COUNT: "1",
			TYPESENSE_COLLECTION: "template-app-next-development",
		},
	},
} satisfies Record<string, Deployment>;
