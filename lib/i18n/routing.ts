import { defineRouting } from "next-intl/routing";

import { defaultLocale, getLanguage, type Locale, locales } from "#/configs/i18n.config.ts";

const prefixes = Object.fromEntries(
	locales.map((locale) => {
		return [locale, `/${getLanguage(locale)}`];
	}),
) as Record<Locale, string>;

export const routing = defineRouting({
	locales,
	defaultLocale,
	localePrefix: {
		mode: "always",
		prefixes,
	},
});
