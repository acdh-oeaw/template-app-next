import optimizeLocales from "@react-aria/optimize-locales-plugin";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { defaultLocale, getLanguage, locales } from "#/configs/i18n.config.ts";

const languages = Array.from(new Set(locales.map(getLanguage)));

/** React Aria only ships some regional variants (e.g. "en-US" but not "en-GB"), and the plugin matches regions exactly. */
const localeOptimization = optimizeLocales.turbopack([
	{ condition: "browser", locales: [] },
	{ condition: { not: "browser" }, locales: languages },
]);

const config: NextConfig = {
	experimental: {
		agentFeedback: true,
		globalNotFound: true,
		turbopackRustReactCompiler: true,
	},
	cacheComponents: true,
	output: process.env.BUILD_MODE === "standalone" ? "standalone" : undefined,
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

export default plugins.reduce((config, plugin) => {
	return plugin(config);
}, config);
