import type { MetadataRoute } from "next";

import { env } from "#/lib/env/public.ts";
import { getAlternateLanguages } from "#/lib/i18n/get-alternate-languages.ts";
import { locales } from "#/lib/i18n/locales.ts";
import { href, type StaticRoute } from "#/lib/navigation/href.ts";
import { getPathname } from "#/lib/navigation/navigation.ts";

/** Lists every static page, so that `bun check` reports new pages until they are included or excluded. */
const staticPages = {
	"/": "include",
	"/accessibility": "include",
	"/about": "include",
	"/e2e/error": "exclude",
	"/e2e/error-boundary": "exclude",
	"/e2e/search-params": "exclude",
	"/imprint": "include",
} satisfies Record<StaticRoute, "exclude" | "include">;

const pages = Object.entries(staticPages)
	.filter(([, status]) => status === "include")
	.map(([pathname]) => href({ pathname: pathname as StaticRoute }));

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
