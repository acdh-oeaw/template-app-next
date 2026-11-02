import { cacheTag } from "next/cache";

import { getLanguage, type Locale } from "#/lib/i18n/locales.ts";

export type SocialMediaKind =
	| "bluesky"
	| "email"
	| "facebook"
	| "flickr"
	| "github"
	| "instagram"
	| "linkedin"
	| "mastodon"
	| "orcid"
	| "rss"
	| "twitter"
	| "website"
	| "youtube";

export interface SocialMediaLink {
	kind: SocialMediaKind;
	href: string;
}

export interface SiteMetadata {
	title: string;
	description: string;
	manifest: {
		name: string;
		shortName: string;
	};
	social: Array<SocialMediaLink>;
}

export async function getSiteMetadata(locale: Locale): Promise<SiteMetadata> {
	"use cache";

	cacheTag("site-metadata");

	/** @see {@link https://github.com/vercel/next.js/issues/97533} */
	const { default: metadata } = (await import(`../../content/${getLanguage(locale)}/metadata.json`)) as {
		default: SiteMetadata;
	};

	return metadata;
}
