import { createPreset as createDesignTokenPreset } from "@acdh-oeaw/tailwindcss-preset";
import type { Config } from "tailwindcss";
import reactAriaComponentsPlugin from "tailwindcss-react-aria-components";

const designTokensPreset = createDesignTokenPreset();

const config = {
	content: [
		"./@(app|components|config|lib|styles)/**/*.@(css|js|ts|tsx)",
		"./content/**/*.@(md|mdx)",
		"./keystatic.config.@(ts|tsx)",
	],
	darkMode: [
		"variant",
		[":where(.kui-theme.kui-scheme--dark) &", ':where([data-ui-color-scheme="dark"]) &'],
	],
	plugins: [reactAriaComponentsPlugin],
	presets: [designTokensPreset],
} satisfies Config;

export default config;
