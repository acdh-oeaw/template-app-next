import { defineRouting } from "next-intl/routing";

import { defaultLocale, getLanguage, type Locale, locales } from "#/configs/i18n.config.ts";

const prefixes = Object.fromEntries(
	locales.map((locale) => {
		return [locale, `/${getLanguage(locale)}`];
	}),
) as Record<Locale, string>;

export const routing = defineRouting({
	/**
	 * Alternates are set in page metadata, see `getAlternateLanguages`. The `link` header does not know which pages
	 * exist, and its `x-default` relies on the proxy `matcher`.
	 *
	 * Additionally, `link` headers set in the proxy currently accumulate on revalidation.
	 *
	 * @see {@link https://github.com/vercel/next.js/issues/94945}
	 */
	alternateLinks: false,
	locales,
	defaultLocale,
	localePrefix: {
		mode: "always",
		prefixes,
	},
});
