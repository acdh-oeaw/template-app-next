import "@/styles/index.css";

import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/nextjs-vite";
import { themes } from "storybook/theming";

import { config as axeConfig } from "@/config/axe.config";
import { formats } from "@/lib/i18n/formats";
import { defaultLocale, locales } from "@/lib/i18n/locales";
import de from "@/messages/de.json";
import en from "@/messages/en.json";

const preview: Preview = {
	decorators: [
		withThemeByDataAttribute({
			attributeName: "data-ui-color-scheme",
			defaultTheme: "light",
			themes: {
				light: "light",
				dark: "dark",
			},
		}),
	],
	initialGlobals: {
		locale: defaultLocale,
		locales: Object.fromEntries(
			locales.map((locale) => {
				return [locale, new Intl.DisplayNames(locale, { type: "language" }).of(locale)];
			}),
		),
	},
	parameters: {
		a11y: {
			config: axeConfig,
			test: "error",
		},
		backgrounds: {
			disable: true,
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		docs: {
			theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? themes.dark : themes.light,
		},
		layout: "fullscreen",
		nextIntl: {
			defaultLocale,
			formats,
			messagesByLocale: { de, en },
		},
		nextjs: {
			appDirectory: true,
		},
	},
};

export default preview;
