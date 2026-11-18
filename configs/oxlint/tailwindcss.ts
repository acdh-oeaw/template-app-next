import { fromRoot } from "#/configs/paths.ts";

/** `settings` is not inherited through `extends`, so this is composed in `oxlint.config.ts`. */
export const settings = {
	tailwindcss: {
		entryPoint: fromRoot("styles/index.css"),
	},
};

export const tailwindcss = {
	jsPlugins: [{ name: "tailwindcss", specifier: "oxlint-tailwindcss" }],
	rules: {
		"tailwindcss/consistent-variant-order": "error",
		"tailwindcss/enforce-canonical": "error",
		"tailwindcss/enforce-consistent-important-position": "error",
		"tailwindcss/enforce-consistent-line-wrapping": "off",
		"tailwindcss/enforce-consistent-variable-syntax": "error",
		"tailwindcss/enforce-logical": "error",
		"tailwindcss/enforce-negative-arbitrary-values": "error",
		"tailwindcss/enforce-physical": "off",
		"tailwindcss/enforce-shorthand": "error",
		"tailwindcss/enforce-sort-order": "off",
		"tailwindcss/max-class-count": "off",
		"tailwindcss/no-arbitrary-value": "off",
		"tailwindcss/no-borrowed-component-styles": "off",
		"tailwindcss/no-conflicting-classes": "error",
		"tailwindcss/no-contradicting-variants": "error",
		"tailwindcss/no-dark-without-light": "error",
		"tailwindcss/no-default-palette": "error",
		"tailwindcss/no-deprecated-classes": "error",
		"tailwindcss/no-duplicate-classes": "off",
		"tailwindcss/no-dynamic-classes": "error",
		"tailwindcss/no-hardcoded-colors": "error",
		"tailwindcss/no-restricted-classes": "off",
		"tailwindcss/no-unknown-classes": "error",
		"tailwindcss/no-unnecessary-arbitrary-value": "error",
		"tailwindcss/no-unnecessary-whitespace": "off",
		"tailwindcss/prefer-scale-token": "off",
		"tailwindcss/prefer-theme-tokens": "error",
	},
};
