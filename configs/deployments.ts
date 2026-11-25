import type { DeployEnv } from "#/lib/env/deploy.ts";

export interface Deployment {
	/** Names and labels the Kubernetes resources, so that they can be found and removed together. */
	name: string;
	/** Must exist in the cluster. */
	namespace: string;
	/** Variables that differ between deployments, and are not secret. Others are set in GitHub. */
	env: DeployEnv;
}

/** By GitHub environment. `bun test` checks that deployments do not share a host or resources. */
export const deployments = {
	production: {
		name: "frontend",
		namespace: "template-app-next",
		env: {
			NEXT_PUBLIC_APP_BASE_URL: "https://template-app-next.acdh-dev.oeaw.ac.at",
		},
	},
	/** Not in the namespace of production, so that nothing that cleans up here can affect it. */
	development: {
		name: "frontend-development",
		namespace: "template-app-next-development",
		env: {
			NEXT_PUBLIC_APP_BASE_URL: "https://template-app-next-development.acdh-dev.oeaw.ac.at",
			TYPESENSE_COLLECTION: "template-app-next-development",
		},
	},
} satisfies Record<string, Deployment>;
