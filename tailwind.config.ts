import { createPreset as createDesignTokenPreset } from "@acdh-oeaw/tailwindcss-preset";
import type { Config } from "tailwindcss";
import reactAriaComponentsPlugin from "tailwindcss-react-aria-components";

const designTokensPreset = createDesignTokenPreset();

const config = {
	content: [
		"./app/**/*.@(css|ts|tsx)",
		"./components/**/*.@(css|ts|tsx)",
		"./content/**/*.@(md|mdx)",
	],
	darkMode: ["selector", '[data-ui-color-scheme="dark"]'],
	theme: {
		fontFamily: {
			body: ["var(--font-body, ui-sans-serif)", "system-ui", "sans-serif"],
			heading: ["var(--font-heading, var(--font-body, ui-sans-serif))", "system-ui", "sans-serif"],
		},
	},
	plugins: [reactAriaComponentsPlugin],
	presets: [designTokensPreset],
} satisfies Config;

export default config;
