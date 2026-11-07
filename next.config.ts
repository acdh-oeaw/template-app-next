import optimizeLocales from "@react-aria/optimize-locales-plugin";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";

import { defaultLocale, getLanguage, locales } from "#/configs/i18n.config.ts";
import { assertPublicEnv, createServerEnv } from "#/lib/env/parse.ts";

const languages = Array.from(new Set(locales.map(getLanguage)));

/** React Aria only ships some regional variants (e.g. "en-US" but not "en-GB"), and the plugin matches regions exactly. */
const localeOptimization = optimizeLocales.turbopack([
	{ condition: "browser", locales: [] },
	{ condition: { not: "browser" }, locales: languages },
]);

const plugins: Array<(config: NextConfig) => NextConfig> = [
	createNextIntlPlugin({
		requestConfig: "./lib/i18n/request.ts",
		experimental: {
			extract: true,
			messages: {
				format: "po",
				locales: languages,
				path: "./messages",
				sourceLocale: getLanguage(defaultLocale),
			},
			srcPath: ["./app", "./components", "./lib"],
		},
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
			turbopackRustReactCompiler: true,
		},
		cacheComponents: true,
		compiler: {
			define,
		},
		/** Keeps the `*.e2e.tsx` routes and their generated types out of regular builds. */
		distDir: env.TEST_BUILD === "true" ? ".next/test" : ".next",
		output: env.BUILD_MODE,
		/** Routes for error pages in e2e tests only exist in test builds, as `*.e2e.tsx` files. */
		pageExtensions: ["tsx", "ts", "jsx", "js", ...(env.TEST_BUILD === "true" ? ["e2e.tsx"] : [])],
		partialPrefetching: true,
		reactCompiler: true,
		rewrites() {
			return Promise.resolve({
				beforeFiles: [],
				afterFiles: [
					/**
					 * Every pathname matches the `[locale]` segment, so `notFound()` in the root layout would show the default
					 * Next.js page for invalid locales. Rewrite them to the catch-all route in the default locale instead. Only
					 * runs for pathnames which did not match a file or a static route.
					 */
					{
						source: `/:segment((?!(?:${locales.join("|")})(?:/|$))[^/]+)/:rest*`,
						destination: `/${defaultLocale}/:segment/:rest*`,
					},
				],
				fallback: [],
			});
		},
		turbopack: {
			rules: {
				"*.css": {
					loaders: ["@tailwindcss/turbopack"],
				},
				...localeOptimization.rules,
			},
		},
	};

	return plugins.reduce((config, plugin) => {
		return plugin(config);
	}, config);
}
