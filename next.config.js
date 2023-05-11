/** @typedef {import('next').NextConfig} NextConfig */

import { log } from "@acdh-oeaw/lib";
import createBundleAnalyzer from "@next/bundle-analyzer";
import createMdxPlugin from "@next/mdx";
import createI18nPlugin from "next-intl/plugin";
import withFrontmatter from "remark-frontmatter";
import withGfm from "remark-gfm";
import withMdxFrontmatter from "remark-mdx-frontmatter";

/** @type {NextConfig} */
const config = {
	eslint: {
		dirs: [process.cwd()],
		ignoreDuringBuilds: true,
	},
	async headers() {
		/** @type {Awaited<ReturnType<NonNullable<NextConfig['headers']>>>} */
		const headers = [];

		/**
		 * Only allow indexing by search engines when the `BOTS` environment variable is set.
		 */
		if (process.env.BOTS !== "enabled") {
			headers.push({
				source: "/:path*",
				headers: [
					{
						key: "X-Robots-Tag",
						value: "noindex, nofollow",
					},
				],
			});

			if (process.env.NODE_ENV === "production") {
				log.warn("Indexing by search engines is disallowed.");
			}
		}

		return headers;
	},
	output: "standalone",
	pageExtensions: ["ts", "tsx", "md", "mdx"],
	typescript: {
		ignoreBuildErrors: true,
	},
};

/** @type {Array<(config: NextConfig) => NextConfig>} */
const plugins = [
	createBundleAnalyzer({ enabled: process.env.BUNDLE_ANALYZER === "enabled" }),
	// @ts-expect-error Upstream type issue.
	createI18nPlugin(),
	createMdxPlugin({
		extension: /\.mdx$/,
		options: {
			remarkPlugins: [withFrontmatter, withMdxFrontmatter, withGfm],
		},
	}),
];

export default plugins.reduce((config, plugin) => {
	return plugin(config);
}, config);
