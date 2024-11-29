import type { Preview } from "@storybook/react";

import { config as axeConfig } from "@/config/axe.config";
import { defaultLocale, formats, locales } from "@/config/i18n.config";
import de from "@/messages/de.json";
import en from "@/messages/en.json";

export const parameters = {
	a11y: {
		config: axeConfig,
	},
	layout: "fullscreen",
};

const preview: Preview = {
	initialGlobals: {
		locale: defaultLocale,
		locales: Object.fromEntries(
			locales.map((locale) => {
				return [locale, new Intl.DisplayNames(locale, { type: "language" }).of(locale)];
			}),
		),
	},
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
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
