import { cacheTag } from "next/cache";
import * as v from "valibot";

import { getLanguage, type Locale } from "#/lib/i18n/locales.ts";

const socialMediaKindSchema = v.picklist([
	"bluesky",
	"email",
	"facebook",
	"flickr",
	"github",
	"instagram",
	"linkedin",
	"mastodon",
	"orcid",
	"rss",
	"twitter",
	"website",
	"youtube",
]);

const socialMediaLinkSchema = v.object({
	kind: socialMediaKindSchema,
	href: v.pipe(v.string(), v.url()),
});

const siteMetadataSchema = v.object({
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.pipe(v.string(), v.nonEmpty()),
	manifest: v.object({
		name: v.pipe(v.string(), v.nonEmpty()),
		shortName: v.pipe(v.string(), v.nonEmpty()),
	}),
	social: v.array(socialMediaLinkSchema),
});

export type SocialMediaKind = v.InferOutput<typeof socialMediaKindSchema>;

export type SocialMediaLink = v.InferOutput<typeof socialMediaLinkSchema>;

export type SiteMetadata = v.InferOutput<typeof siteMetadataSchema>;

export class SiteMetadataError extends Error {
	override name = "SiteMetadataError";
}

export async function getSiteMetadata(locale: Locale): Promise<SiteMetadata> {
	"use cache";

	cacheTag("site-metadata");

	const language = getLanguage(locale);

	/** @see {@link https://github.com/vercel/next.js/issues/97533} */
	const { default: metadata } = (await import(`../../content/${language}/metadata.json`)) as {
		default: unknown;
	};

	const result = v.safeParse(siteMetadataSchema, metadata);

	if (!result.success) {
		throw new SiteMetadataError(`Invalid \`content/${language}/metadata.json\`.\n\n${v.summarize(result.issues)}`);
	}

	return result.output;
}
