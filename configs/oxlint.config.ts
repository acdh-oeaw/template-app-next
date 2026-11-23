import { base } from "#/configs/oxlint/base.ts";
import { bunTest } from "#/configs/oxlint/bun-test.ts";
import { nextjs } from "#/configs/oxlint/nextjs.ts";
import { playwright } from "#/configs/oxlint/playwright.ts";
import { react, settings as reactSettings } from "#/configs/oxlint/react.ts";
import { regexp } from "#/configs/oxlint/regexp.ts";
import { tailwindcss, settings as tailwindcssSettings } from "#/configs/oxlint/tailwindcss.ts";
import { fromRoot } from "#/configs/paths.ts";

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

/** Navigation that requires an `Href`, see `lib/navigation/href.ts`. Each wrapper imports the module it wraps. */
const linkPaths = [
	{
		name: "next/link",
		message: "Use `Link` from `#/components/link.tsx`.",
	},
	{
		name: "react-aria-components",
		importNames: ["Link"],
		message: "Use `Link` from `#/components/link.tsx`.",
	},
	{
		name: "react-aria-components/Link",
		message: "Use `Link` from `#/components/link.tsx`.",
	},
	{
		name: "#/lib/navigation/navigation.ts",
		importNames: ["Link"],
		message: "Use `Link` from `#/components/link.tsx`.",
	},
];

const navigationPaths = [
	{
		name: "next/navigation",
		importNames: ["permanentRedirect", "redirect"],
		message: "Use `#/lib/navigation/navigation.ts`.",
	},
	{
		name: "next/navigation",
		importNames: ["usePathname", "useRouter"],
		message: "Use `#/lib/navigation/navigation-hooks.ts`.",
	},
	{
		name: "next-intl/navigation",
		message: "Use `#/lib/navigation/navigation.ts` or `#/lib/navigation/navigation-hooks.ts`.",
	},
	{
		name: "#/lib/navigation/href.ts",
		importNames: ["unsafeHref"],
		message: "Use `href()`, or add a helper to `#/lib/navigation/href.ts`.",
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

/** Services hold the business logic, independent of the framework, so they can be called and tested without it. */
const frameworkPatterns = [
	{
		group: ["next", "next/**", "next-intl", "next-intl/**", "react", "react/**", "react-dom", "react-dom/**"],
		message: "Services are framework-agnostic. Handle framework concerns, like translations, in the caller.",
	},
	{
		group: ["server-only", "#/app/**", "#/components/**", "#/lib/env/**", "#/lib/server-actions/**"],
		message: "Services are framework-agnostic. Pass configuration, like `env` values, as dependencies.",
	},
];

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
		...reactSettings,
		...tailwindcssSettings,
	},
	rules: {
		"no-restricted-imports": [
			"error",
			{ paths: [...restrictedPaths, ...linkPaths, ...navigationPaths, envParsePath], patterns: restrictedPatterns },
		],
	},
	overrides: [
		{
			files: [fromRoot("app/**"), fromRoot("components/**")],
			rules: {
				"no-restricted-imports": [
					"error",
					{
						paths: [...restrictedPaths, ...linkPaths, ...navigationPaths, envParsePath],
						patterns: [...restrictedPatterns, configsPattern],
					},
				],
			},
		},
		{
			files: [fromRoot("components/link.tsx")],
			rules: {
				"no-restricted-imports": [
					"error",
					{
						paths: [...restrictedPaths, ...navigationPaths, envParsePath],
						patterns: [...restrictedPatterns, configsPattern],
					},
				],
			},
		},
		{
			files: [fromRoot("lib/navigation/navigation.ts"), fromRoot("lib/navigation/navigation-hooks.ts")],
			rules: {
				"no-restricted-imports": [
					"error",
					{ paths: [...restrictedPaths, ...linkPaths, envParsePath], patterns: restrictedPatterns },
				],
			},
		},
		{
			files: [
				fromRoot("next.config.ts"),
				fromRoot("instrumentation.ts"),
				fromRoot("lib/env/**"),
				fromRoot("scripts/search-index.ts"),
			],
			rules: {
				"no-restricted-imports": ["error", { paths: restrictedPaths, patterns: restrictedPatterns }],
			},
		},
		{
			files: [fromRoot("services/**")],
			rules: {
				"no-restricted-imports": [
					"error",
					{
						paths: [...restrictedPaths, envParsePath],
						patterns: [...restrictedPatterns, configsPattern, ...frameworkPatterns],
					},
				],
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
