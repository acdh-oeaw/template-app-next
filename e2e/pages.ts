import { getLanguage, locales } from "#/configs/i18n.config.ts";
import { sitemapPathnames } from "#/lib/navigation/static-pages.ts";

/** The pages that the sitemap lists, in every locale, like `/en/about`. */
export const sitemapPages = locales.flatMap((locale) =>
	sitemapPathnames.map((pathname) => `/${getLanguage(locale)}${pathname === "/" ? "" : pathname}`),
);
