import { defineConfig } from "oxlint";

const config = defineConfig({
	env: {
		builtin: true,
		browser: true,
	},
	plugins: ["nextjs"],
	rules: {
		/**
		 * ================================================================================================================
		 * Correctness.
		 * ================================================================================================================
		 */

		"nextjs/google-font-display": "off",
		"nextjs/google-font-preconnect": "off",
		"nextjs/inline-script-id": "error",
		"nextjs/next-script-for-ga": "off",
		"nextjs/no-assign-module-variable": "off",
		"nextjs/no-async-client-component": "error",
		"nextjs/no-before-interactive-script-outside-document": "off",
		"nextjs/no-css-tags": "error",
		"nextjs/no-document-import-in-page": "off",
		"nextjs/no-duplicate-head": "off",
		"nextjs/no-head-element": "off",
		"nextjs/no-head-import-in-document": "off",
		"nextjs/no-html-link-for-pages": "error",
		"nextjs/no-img-element": "warn",
		"nextjs/no-page-custom-font": "off",
		"nextjs/no-script-component-in-head": "off",
		"nextjs/no-styled-jsx-in-document": "off",
		"nextjs/no-sync-scripts": "warn",
		"nextjs/no-title-in-document-head": "off",
		"nextjs/no-typos": "off",
		"nextjs/no-unwanted-polyfillio": "off",

		/**
		 * ================================================================================================================
		 * Restriction.
		 * ================================================================================================================
		 */

		"no-restricted-imports": [
			"error",
			{
				paths: [
					{
						allowImportNames: ["useLinkStatus"],
						message: "Please use `@dariah-eric/ui/link` instead.",
						name: "next/link",
					},
					{
						importNames: ["permanentRedirect", "redirect", "usePathname", "useRouter", "useSearchParams"],
						message: "Please use `@/lib/navigation/navigation` instead.",
						name: "next/navigation",
					},
					{
						message: "Please use `@/lib/navigation/navigation` instead.",
						name: "next/router",
					},
				],
			},
		],
	},
	overrides: [
		{
			files: [
				"next.config.ts",
				"app/**/default.tsx",
				"app/**/error.tsx",
				"app/**/forbidden.tsx",
				"app/**/global-error.tsx",
				"app/**/global-not-found.tsx",
				"app/**/layout.tsx",
				"app/**/loading.tsx",
				"app/**/not-found.tsx",
				"app/**/opengraph-image.tsx",
				"app/**/page.tsx",
				"app/**/unauthorized.tsx",
				"app/manifest.ts",
				"app/robots.ts",
				"app/sitemap.ts",
				"e2e/playwright.config.ts",
			],
			rules: {
				"import/no-default-export": "off",
			},
		},
	],
});

export default config;
