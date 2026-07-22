import { defineConfig } from "oxlint";

const config = defineConfig({
	env: {
		builtin: true,
		browser: true,
	},
	plugins: ["vitest"],
	overrides: [
		{
			files: ["**/*.test.ts", "!e2e/**/*.test.ts"],
			rules: {
				/**
				 * ============================================================================================================
				 * Correctness.
				 * ============================================================================================================
				 */

				"vitest/consistent-each-for": "error",
				"vitest/hoisted-apis-on-top": "error",
				"vitest/no-conditional-tests": "error",
				"vitest/require-local-test-context-for-concurrent-snapshots": "error",
				"vitest/warn-todo": "error",

				/**
				 * ============================================================================================================
				 * Style.
				 * ============================================================================================================
				 */

				"vitest/consistent-test-filename": "off",
				"vitest/consistent-vitest-vi": "error",
				"vitest/no-import-node-test": "error",
				"vitest/no-importing-vitest-globals": "off",
				"vitest/prefer-called-once": "error",
				"vitest/prefer-called-times": "error",
				"vitest/prefer-describe-function-title": "off",
				"vitest/prefer-expect-type-of": "error",
				"vitest/prefer-import-in-mock": "error",
				"vitest/prefer-to-be-falsy": "error",
				"vitest/prefer-to-be-object": "error",
				"vitest/prefer-to-be-truthy": "error",
			},
		},
	],
});

export default config;
