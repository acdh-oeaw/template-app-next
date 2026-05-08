import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const config: NextConfig = {
	allowedDevOrigins: ["127.0.0.1"],
	cacheComponents: true,
	/** Compression should be handled by `nginx` reverse proxy. */
	compress: false,
	experimental: {
		appNewScrollHandler: true,
		authInterrupts: true,
		cachedNavigations: true,
		globalNotFound: true,
		rootParams: true,
		strictRouteTypes: true,
		taint: true,
		viewTransition: true,
	},
	headers() {
		const headers: Awaited<ReturnType<NonNullable<NextConfig["headers"]>>> = [
			/** @see {@link https://nextjs.org/docs/app/guides/self-hosting#streaming-and-suspense} */
			{ source: "/:path*{/}?", headers: [{ key: "x-accel-buffering", value: "no" }] },
		];

		return headers;
	},
	images: {
		domains: ["imgproxy.acdh.oeaw.ac.at"],
	},
	logging: {
		browserToTerminal: true,
		fetches: {
			hmrRefreshes: true,
			fullUrl: true,
		},
	},
	// output: env.BUILD_MODE,
	outputFileTracingIncludes: {
		"**/*": ["./public/assets/fonts/*.ttf"],
	},
	reactCompiler: true,
	turbopack: {
		rules: {
			/** @see {@link https://github.com/vercel/next.js/discussions/77721#discussioncomment-14576268} */
			"*": {
				condition: {
					all: [
						"foreign",
						"browser",
						{
							path: /(@react-stately|@react-aria|@react-spectrum|react-aria-components)\/.*\/[a-z]{2}-[A-Z]{2}/,
						},
					],
				},
				loaders: ["null-loader"],
				as: "*.js",
			},
		},
	},
	typedRoutes: true,
	typescript: {
		ignoreBuildErrors: true,
	},
};

const plugins = [
	createNextIntlPlugin({
		experimental: {
			/** @see {@link https://next-intl.dev/docs/workflows/typescript#messages-arguments} */
			createMessagesDeclaration: ["./messages/metadata/en/index.json"],
			extract: {
				sourceLocale: "en",
			},
			messages: {
				format: "po",
				locales: "infer",
				path: "./messages",
				precompile: true,
			},
			srcPath: ["./app", "./components", "./lib"],
		},
		requestConfig: "./lib/i18n/request.ts",
	}),
];

// oxlint-disable-next-line no-shadow
export default plugins.reduce((config, plugin) => plugin(config), config);
