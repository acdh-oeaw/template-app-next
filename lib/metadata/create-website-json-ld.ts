import type { WebSite, WithContext } from "schema-dts";

import { env } from "#/lib/env/public.ts";
import type { Locale } from "#/lib/i18n/locales.ts";
import type { SiteMetadata, SocialMediaKind } from "#/lib/metadata/site-metadata.ts";
import { href } from "#/lib/navigation/href.ts";
import { getPathname } from "#/lib/navigation/navigation.ts";

/** Links that identify the publisher, not contact channels or feeds. */
const excludedSameAsKinds = new Set<SocialMediaKind>(["email", "rss"]);

export function createWebSiteJsonLd(meta: SiteMetadata, locale: Locale): WithContext<WebSite> {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: meta.title,
		description: meta.description,
		url: new URL(getPathname({ locale, href: href({ pathname: "/" }) }), env.NEXT_PUBLIC_APP_BASE_URL).href,
		inLanguage: locale,
		sameAs: meta.social.filter((link) => !excludedSameAsKinds.has(link.kind)).map((link) => link.href),
	};
}
