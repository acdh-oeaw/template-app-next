import * as path from "node:path";
import { fileURLToPath } from "node:url";

import bunDefaults from "#/configs/oxlint/bun-defaults.ts";

const root = path.dirname(fileURLToPath(import.meta.resolve("#/package.json")));

const restrictedPaths = [
	{
		name: "next-intl",
		importNames: ["useTranslations"],
		message: 'Use `import { useExtracted as useTranslations } from "next-intl"`.',
	},
	{
		name: "next-intl/server",
		importNames: ["getTranslations"],
		message: 'Use `import { getExtracted as getTranslations } from "next-intl/server"`.',
	},
];

const envParsePath = {
	name: "#/lib/env/parse.ts",
	message: "Import `env` from `#/lib/env/server.ts` or `#/lib/env/public.ts`.",
};

const config = {
	extends: [bunDefaults],
	plugins: [...bunDefaults.plugins, "node"],
	options: {
		typeAware: true,
	},
	rules: {
		"@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "with-single-extends" }],
		"no-restricted-imports": ["error", { paths: [...restrictedPaths, envParsePath] }],
		"node/no-process-env": ["error", { allowedVariables: ["CI", "NODE_ENV"] }],
	},
	overrides: [
		{
			files: ["**/playwright.config.ts"],
			rules: {
				"node/no-process-env": ["error", { allowedVariables: ["CI", "PORT"] }],
			},
		},
		{
			files: [path.join(root, "lib/env/**"), path.join(root, "scripts/env-sync.ts")],
			rules: {
				"node/no-process-env": "off",
			},
		},
		{
			files: [path.join(root, "app/**"), path.join(root, "components/**")],
			rules: {
				"no-restricted-imports": [
					"error",
					{
						paths: [...restrictedPaths, envParsePath],
						patterns: [{ group: ["#/configs/*", "**/configs/*"], message: "Import from `#/lib/*` instead." }],
					},
				],
			},
		},
		{
			files: [path.join(root, "next.config.ts"), path.join(root, "instrumentation.ts"), path.join(root, "lib/env/**")],
			rules: {
				"no-restricted-imports": ["error", { paths: restrictedPaths }],
			},
		},
	],
};

export default config;
