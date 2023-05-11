import typographyPlugin from "@tailwindcss/typography";
import { type Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
	content: [
		"./content/**/*.mdx",
		"./src/app/**/*.@(css|ts|tsx)",
		"./src/components/**/*.@(css|ts|tsx)",
	],
	darkMode: ["class", '[data-color-scheme="dark"]'],
	plugins: [animatePlugin, typographyPlugin],
	theme: {
		extend: {
			colors: {
				foreground: "hsl(var(--color-foreground))",
				background: "hsl(var(--color-background))",
				"surface-foreground": "hsl(var(--color-surface-foreground))",
				"surface-background": "hsl(var(--color-surface-background))",
				"primary-foreground": "hsl(var(--color-primary-foreground))",
				"primary-background": "hsl(var(--color-primary-background))",
				"secondary-foreground": "hsl(var(--color-secondary-foreground))",
				"secondary-background": "hsl(var(--color-secondary-background))",
				"muted-foreground": "hsl(var(--color-muted-foreground))",
				"muted-background": "hsl(var(--color-muted-background))",
				"accent-foreground": "hsl(var(--color-accent-foreground))",
				"accent-background": "hsl(var(--color-accent-background))",
				"negative-foreground": "hsl(var(--color-negative-foreground))",
				"negative-background": "hsl(var(--color-negative-background))",
				"positive-foreground": "hsl(var(--color-positive-foreground))",
				"positive-background": "hsl(var(--color-positive-background))",
				border: "hsl(var(--color-border))",
				input: "hsl(var(--color-input))",
				"focus-ring": "hsl(var(--color-focus-ring))",
			},
			container: {
				center: true,
				padding: "1rem",
				screens: {
					"2xl": "1536px",
				},
			},
			fontFamily: {
				body: ["var(--font-body)"],
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: null,
					},
				},
			},
		},
	},
};

export default config;
