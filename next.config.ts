import createBundleAnalyzer from "@next/bundle-analyzer";
import createMdxPlugin from "@next/mdx";
import localesPlugin from "@react-aria/optimize-locales-plugin";
import type { NextConfig } from "next";
import createI18nPlugin from "next-intl/plugin";

import { env } from "@/config/env.config";
import { createConfig as createMdxConfig } from "@/config/mdx.config";

const config: NextConfig = {
	eslint: {
		dirs: [process.cwd()],
		ignoreDuringBuilds: true,
	},
	experimental: {
		reactCompiler: true,
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	output: env.BUILD_MODE,
	pageExtensions: ["ts", "tsx", "md", "mdx"],
	redirects() {
		const redirects: Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>> = [
			{
				source: "/admin",
				destination: "/keystatic",
				permanent: false,
			},
		];

		return Promise.resolve(redirects);
	},
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

export default async function createConfig() {
	const plugins: Array<(config: NextConfig) => NextConfig> = [
		createBundleAnalyzer({ enabled: env.BUNDLE_ANALYZER === "enabled" }),
		createI18nPlugin("./lib/i18n.ts"),
		createMdxPlugin({
			extension: /\.(md|mdx)$/,
			// FIXME: @see https://github.com/vercel/next.js/issues/65652
			options: await createMdxConfig(),
		}),
	];

	return plugins.reduce((config, plugin) => {
		return plugin(config);
	}, config);
}
