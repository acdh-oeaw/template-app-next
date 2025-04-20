import type { TSESLint } from "@typescript-eslint/utils";

import { rule } from "./rules/icons";

const plugin = {
	meta: {
		name: "@acdh-oeaw/eslint-plugin-template-app-next",
		version: "0.0.0",
	},
	configs: {
		get recommended() {
			return recommended;
		},
	},
	rules: {
		icons: rule,
	},
} satisfies TSESLint.FlatConfig.Plugin;

const recommended: TSESLint.FlatConfig.Config = {
	plugins: {
		"@acdh-oeaw/eslint-plugin-template-app-next": plugin,
	},
	rules: {
		"@acdh-oeaw/eslint-plugin-template-app-next/icons": "error",
	},
	languageOptions: {
		parserOptions: {
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
};

// eslint-disable-next-line import-x/no-default-export
export default plugin;
