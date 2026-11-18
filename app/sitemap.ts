import type { MetadataRoute } from "next";

import { env } from "#/lib/env/public.ts";
import { getAlternateLanguages } from "#/lib/i18n/get-alternate-languages.ts";
import { locales } from "#/lib/i18n/locales.ts";
import { getPathname } from "#/lib/i18n/navigation.ts";
import { type Href, href } from "#/lib/navigation/href.ts";

const pages: Array<Href> = [href({ pathname: "/" }), href({ pathname: "/about" }), href({ pathname: "/imprint" })];

/** Only set `lastModified` to a real content date, never `new Date()`: crawlers ignore unreliable values. */
export default function sitemap(): MetadataRoute.Sitemap {
	return pages.flatMap((href) => {
		const languages = getAlternateLanguages(href);

		return locales.map((locale) => {
			return {
				url: new URL(getPathname({ locale, href }), env.NEXT_PUBLIC_APP_BASE_URL).href,
				alternates: { languages },
			};
		});
	});
}
