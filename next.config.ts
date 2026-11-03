import optimizeLocales from "@react-aria/optimize-locales-plugin";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

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

	const publicEnv = phase === PHASE_DEVELOPMENT_SERVER || env.ENV_VALIDATION === "enabled" ? assertPublicEnv() : null;

	const config: NextConfig = {
		experimental: {
			agentFeedback: true,
			globalNotFound: true,
			turbopackRustReactCompiler: true,
		},
		cacheComponents: true,
		compiler: {
			define: {
				__PUBLIC_ENV__: JSON.stringify(publicEnv),
			},
		},
		output: env.BUILD_MODE,
		partialPrefetching: true,
		reactCompiler: true,
		turbopack: {
			rules: {
				"*.css": {
					loaders: ["@tailwindcss/turbopack"],
					as: "*.css",
				},
				...localeOptimization.rules,
			},
		},
	};

	return plugins.reduce((config, plugin) => {
		return plugin(config);
	}, config);
}
