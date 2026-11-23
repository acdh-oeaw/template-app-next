import { getLanguage, locales } from "#/lib/i18n/locales.ts";
import { sitemapPathnames } from "#/lib/navigation/static-pages.ts";

/** The pages that the sitemap lists, in every locale, like `/en/about`. */
export const sitemapPages = locales.flatMap((locale) =>
	sitemapPathnames.map((pathname) => `/${getLanguage(locale)}${pathname === "/" ? "" : pathname}`),
);
