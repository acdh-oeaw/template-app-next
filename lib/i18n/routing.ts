import { defineRouting } from "next-intl/routing";

import { defaultLocale, getLanguage, type Locale, locales } from "#/lib/i18n/locales.ts";

export const prefixes = Object.fromEntries(locales.map((locale) => [locale, `/${getLanguage(locale)}`])) as Record<
	Locale,
	string
>;

export const routing = defineRouting({
	/**
	 * Alternates are set in page metadata, see `getAlternateLanguages`. The `link` header does not know which pages
	 * exist, and its `x-default` relies on the proxy `matcher`.
	 */
	alternateLinks: false,
	locales,
	defaultLocale,
	localePrefix: {
		mode: "always",
		prefixes,
	},
});
