import optimizeLocales from "@react-aria/optimize-locales-plugin";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";

import { assertPublicEnv, createServerEnv } from "#/lib/env/parse.ts";
import { extractorConfig } from "#/lib/i18n/extractor-config.ts";
import { getLanguage, locales } from "#/lib/i18n/locales.ts";

const languages = Array.from(new Set(locales.map((locale) => getLanguage(locale))));

/** React Aria only ships some regional variants (e.g. "en-US" but not "en-GB"), and the plugin matches regions exactly. */
const localeOptimization = optimizeLocales.turbopack([
	{ condition: "browser", locales: [] },
	{ condition: { not: "browser" }, locales: languages },
]);

const plugins: Array<(config: NextConfig) => NextConfig> = [
	createNextIntlPlugin({
		requestConfig: "./lib/i18n/request.ts",
		experimental: { ...extractorConfig, extract: true },
	}),
];

export default function createConfig(phase: string): NextConfig {
	const env = createServerEnv();

	/** Read by Next.js directly from `process.env`, so validate it when loading the config. */
	void env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY;

	const define: Record<string, string> =
		phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD
			? {
					/** Read when bundling, and again by `next dev` when `.env*` files change, but not by `next typegen`. */
					get __PUBLIC_ENV__() {
						return JSON.stringify(assertPublicEnv());
					},
				}
			: {};

	const config: NextConfig = {
		experimental: {
			agentFeedback: true,
			exposeTestingApiInProductionBuild: env.BUILD_TARGET === "e2e",
			globalNotFound: true,
			strictRouteTypes: true,
			turbopackRustReactCompiler: true,
		},
		cacheComponents: true,
		/** Traefik compresses responses, also with brotli and zstd, but not when they are already compressed. */
		compress: false,
		logging: {
			/** Probes hit the health checks every few seconds. */
			incomingRequests: { ignore: [/^\/api\/health\/(?:live|ready)$/] },
		},
		compiler: {
			define,
		},
		output: env.BUILD_MODE,
		partialPrefetching: true,
		reactCompiler: true,
		turbopack: {
			rules: {
				"*.css": {
					loaders: ["@tailwindcss/turbopack"],
				},
				...localeOptimization.rules,
			},
		},
		typedRoutes: false,
		typescript: {
			/** Type checking runs separately with `bun run types:check`, so `next build` does not repeat it. */
			ignoreBuildErrors: true,
		},
	};

	return plugins.reduce((config, plugin) => plugin(config), config);
}
