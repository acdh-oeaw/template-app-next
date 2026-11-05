import { env } from "#/lib/env/public.ts";
import { defaultLocale, type Locale, locales } from "#/lib/i18n/locales.ts";
import { getPathname } from "#/lib/i18n/navigation.ts";

export type Href = Parameters<typeof getPathname>[0]["href"];

/**
 * Returns absolute `hreflang` urls for page metadata and sitemaps.
 *
 * Search engines ignore alternates which are not reciprocal, so every locale version of a page must list itself and all
 * other versions.
 *
 * `x-default` points to the default locale, so it resolves regardless of the proxy `matcher`. An unprefixed url (as in
 * the `next-intl` `link` header) would only work if the `matcher` redirects all unprefixed pathnames, not just `/`.
 *
 * @see {@link https://developers.google.com/search/docs/specialty/international/localized-versions}
 */
export function getAlternateLanguages(href: Href): Record<string, string> {
	function getUrl(locale: Locale): string {
		return new URL(getPathname({ locale, href }), env.NEXT_PUBLIC_APP_BASE_URL).href;
	}

	const languages: Record<string, string> = {};
	for (const locale of locales) {
		languages[locale] = getUrl(locale);
	}
	languages["x-default"] = getUrl(defaultLocale);

	return languages;
}
