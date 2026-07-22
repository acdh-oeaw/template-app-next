import * as path from "node:path";

import { defineConfig } from "oxlint";

import base from "./configs/oxlint/base.ts";
import nextjs from "./configs/oxlint/nextjs.ts";
import playwright from "./configs/oxlint/playwright.ts";
import react from "./configs/oxlint/react.ts";
import regexp from "./configs/oxlint/regexp.ts";
import storybook from "./configs/oxlint/storybook.ts";
import tailwindcss from "./configs/oxlint/tailwindcss.ts";
import vitest from "./configs/oxlint/vitest.ts";

const config = defineConfig({
	extends: [base, nextjs, playwright, react, regexp, storybook, tailwindcss, vitest],
	// FIXME: `regexp` plugin crashes on "declare module '*.po';"
	ignorePatterns: ["**/*.d.ts"],
	options: {
		reportUnusedDisableDirectives: "error",
		typeAware: true,
		typeCheck: true,
	},
	rules: {
		"no-restricted-imports": ["error", { patterns: [{ group: ["./*", "../*"] }] }],
	},
	settings: {
		"better-tailwindcss": {
			cwd: import.meta.dirname,
			entryPoint: path.join(import.meta.dirname, "./styles/index.css"),
		},
	},
	overrides: [
		{
			files: ["configs/**/*.ts"],
			rules: {
				"import/no-default-export": "off",
			},
		},
	],
});

export default config;
