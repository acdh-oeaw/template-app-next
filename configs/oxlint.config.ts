import { base } from "#/configs/oxlint/base.ts";
import { bunTest } from "#/configs/oxlint/bun-test.ts";
import { nextjs } from "#/configs/oxlint/nextjs.ts";
import { fromRoot } from "#/configs/oxlint/paths.ts";
import { playwright } from "#/configs/oxlint/playwright.ts";
import { react, settings as reactSettings } from "#/configs/oxlint/react.ts";
import { regexp } from "#/configs/oxlint/regexp.ts";
import { tailwindcss, settings as tailwindcssSettings } from "#/configs/oxlint/tailwindcss.ts";

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
	{
		name: "next/router",
		message: "Use `next/navigation`.",
	},
];

const restrictedPatterns = [
	{
		group: ["next/dist/**"],
		message: "Use a public entrypoint instead of Next.js internals.",
	},
	{
		group: ["./**", "../**"],
		message: "Use a subpath import (`#/*`).",
	},
];

const envParsePath = {
	name: "#/lib/env/parse.ts",
	message: "Import `env` from `#/lib/env/server.ts` or `#/lib/env/public.ts`.",
};

const configsPattern = {
	group: ["#/configs/*"],
	message: "Import from `#/lib/*` instead.",
};

/**
 * Every rule is configured explicitly, so no rule is enabled by its category. `categories`, `env` and `settings` are
 * not inherited through `extends`, and rule options are replaced, not merged, so these are all declared here.
 */
const config = {
	categories: {
		correctness: "off",
		nursery: "off",
		pedantic: "off",
		perf: "off",
		restriction: "off",
		style: "off",
		suspicious: "off",
	},
	extends: [base, bunTest, nextjs, playwright, react, regexp, tailwindcss],
	env: {
		browser: true,
		builtin: true,
	},
	options: {
		reportUnusedDisableDirectives: "error",
		typeAware: true,
	},
	settings: {
		react: reactSettings,
		tailwindcss: tailwindcssSettings,
	},
	rules: {
		"no-restricted-imports": ["error", { paths: [...restrictedPaths, envParsePath], patterns: restrictedPatterns }],
	},
	overrides: [
		{
			files: [fromRoot("app/**"), fromRoot("components/**")],
			rules: {
				"no-restricted-imports": [
					"error",
					{ paths: [...restrictedPaths, envParsePath], patterns: [...restrictedPatterns, configsPattern] },
				],
			},
		},
		{
			files: [fromRoot("next.config.ts"), fromRoot("instrumentation.ts"), fromRoot("lib/env/**")],
			rules: {
				"no-restricted-imports": ["error", { paths: restrictedPaths, patterns: restrictedPatterns }],
			},
		},
		{
			/** A glob without a slash matches the file name in any directory. */
			files: ["*.config.ts", fromRoot("lib/i18n/request.ts")],
			rules: {
				"import/no-default-export": "off",
			},
		},
		{
			files: ["playwright.config.ts"],
			rules: {
				"node/no-process-env": ["error", { allowedVariables: ["CI", "PORT"] }],
			},
		},
		{
			files: [fromRoot("lib/env/**"), fromRoot("scripts/env-sync.ts")],
			rules: {
				"node/no-process-env": "off",
			},
		},
		{
			files: [fromRoot("scripts/**")],
			rules: {
				"no-console": "off",
				"node/no-top-level-await": "off",
			},
		},
		/** Tests and scripts run steps in sequence on purpose, and match short, throwaway patterns. */
		{
			files: [fromRoot("e2e/**"), fromRoot("scripts/**")],
			rules: {
				"no-await-in-loop": "off",
				"prefer-named-capture-group": "off",
			},
		},
	],
};

export default config;
