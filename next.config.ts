import createBundleAnalyzerPlugin from "@next/bundle-analyzer";
import localesPlugin from "@react-aria/optimize-locales-plugin";
import type { NextConfig as Config } from "next";
import createI18nPlugin from "next-intl/plugin";

import { env } from "@/config/env.config";

const config: Config = {
	allowedDevOrigins: ["127.0.0.1"],
	// cacheComponents: true,
	/** Compression should be handled by nginx reverse proxy. */
	compress: false,
	experimental: {
		browserDebugInfoInTerminal: true,
		globalNotFound: true,
	},
	headers() {
		const headers: Awaited<ReturnType<NonNullable<Config["headers"]>>> = [
			/** @see https://nextjs.org/docs/app/building-your-application/deploying#streaming-and-suspense */
			{
				source: "/:path*{/}?",
				headers: [
					{
						key: "X-Accel-Buffering",
						value: "no",
					},
				],
			},
		];

		return Promise.resolve(headers);
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	output: env.BUILD_MODE,
	reactCompiler: true,
	// typedRoutes: true,
	typescript: {
		ignoreBuildErrors: true,
	},
	webpack(config, { isServer }) {
		/**
		 * @see https://react-spectrum.adobe.com/react-aria/ssr.html#nextjs-app-router
		 */
		if (!isServer) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			config.plugins.push(localesPlugin.webpack({ locales: [] }));
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return config;
	},
};

const plugins: Array<(config: Config) => Config> = [
	createBundleAnalyzerPlugin({ enabled: env.BUNDLE_ANALYZER === "enabled" }),
	createI18nPlugin({
		experimental: {
			/** @see https://next-intl.dev/docs/workflows/typescript#messages-arguments */
			createMessagesDeclaration: ["./content/en/metadata/index.json", "./messages/en.json"],
		},
		requestConfig: "./lib/i18n/request.ts",
	}),
];

export default plugins.reduce((config, plugin) => {
	return plugin(config);
}, config);
