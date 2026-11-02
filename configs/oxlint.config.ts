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

const config = {
	extends: [bunDefaults],
	options: {
		typeAware: true,
	},
	rules: {
		"@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "with-single-extends" }],
		"no-restricted-imports": ["error", { paths: restrictedPaths }],
	},
	overrides: [
		{
			files: [path.join(root, "app/**"), path.join(root, "components/**")],
			rules: {
				"no-restricted-imports": [
					"error",
					{
						paths: restrictedPaths,
						patterns: [{ group: ["#/configs/*", "**/configs/*"], message: "Import from `#/lib/*` instead." }],
					},
				],
			},
		},
	],
};

export default config;
