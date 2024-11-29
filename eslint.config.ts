import { resolve } from "node:path";

import baseConfig from "@acdh-oeaw/eslint-config";
import nextConfig from "@acdh-oeaw/eslint-config-next";
import nodeConfig from "@acdh-oeaw/eslint-config-node";
import playwrightConfig from "@acdh-oeaw/eslint-config-playwright";
import reactConfig from "@acdh-oeaw/eslint-config-react";
import storybookConfig from "@acdh-oeaw/eslint-config-storybook";
import tailwindConfig from "@acdh-oeaw/eslint-config-tailwindcss";
import gitignore from "eslint-config-flat-gitignore";
import checkFilePlugin from "eslint-plugin-check-file";
import { config } from "typescript-eslint";

import plugin from "./config/eslint/plugin";

export default config(
	gitignore({ strict: false }),
	{ ignores: ["content/**", "public/**"] },
	baseConfig,
	reactConfig,
	nextConfig,
	tailwindConfig,
	{
		settings: {
			tailwindcss: {
				config: resolve("./styles/index.css"),
			},
		},
	},
	{
		files: ["**/*.tsx"],
		extends: [plugin.configs.recommended],
	},
	playwrightConfig,
	storybookConfig,
	{
		plugins: {
			"check-file": checkFilePlugin,
		},
		rules: {
			"check-file/filename-naming-convention": [
				"error",
				{
					"**/*": "?(_)+([a-z])*([a-z0-9])*(-+([a-z0-9]))",
				},
				{ ignoreMiddleExtensions: true },
			],
			"check-file/folder-naming-convention": [
				"error",
				{
					"**/": "NEXT_JS_APP_ROUTER_CASE",
				},
			],
		},
	},
	{
		rules: {
			"arrow-body-style": ["error", "always"],
			"no-restricted-imports": [
				"error",
				{
					name: "next/image",
					allowImportNames: ["StaticImageData"],
					message: "Please use `@/components/image` or `@/components/server-image` instead.",
				},
				{
					name: "next/link",
					allowImportNames: ["useLinkStatus"],
					message: "Please use `@/components/link` instead.",
				},
				{
					name: "next/navigation",
					importNames: [
						"permanentRedirect",
						"redirect",
						"usePathname",
						"useRouter",
						"useSearchParams",
					],
					message: "Please use `@/lib/navigation/navigation` instead.",
				},
				{
					name: "next/router",
					message: "Please use `@/lib/navigation/navigation` instead.",
				},
			],
			"no-restricted-syntax": [
				"error",
				{
					selector: 'MemberExpression[computed!=true][object.name="process"][property.name="env"]',
					message: "Please use `@/config/env.config` instead.",
				},
			],
			// "@typescript-eslint/explicit-module-boundary-types": "error",
			"@typescript-eslint/require-array-sort-compare": "error",
			/** Avoid hardcoded, non-translated strings. */
			"react/jsx-no-literals": [
				"error",
				{
					allowedStrings: [
						"&amp;",
						"&apos;",
						"&copy;",
						"&gt;",
						"&lt;",
						"&nbsp;",
						"&quot;",
						"&rarr;",
						"&larr;",
						"&mdash;",
						"&ndash;",
						".",
						"!",
						":",
						";",
						",",
						"-",
						"(",
						")",
						"|",
						"/",
					],
				},
			],
			// "@typescript-eslint/strict-boolean-expressions": "error",
			"react/jsx-sort-props": ["error", { reservedFirst: true }],
			"react-x/prefer-read-only-props": "error",
		},
	},
	{
		files: ["db/**/*.ts", "lib/server/**/*.ts", "**/_actions/**/*.ts", "**/_lib/actions/**/*.ts"],
		extends: [nodeConfig],
	},
);
