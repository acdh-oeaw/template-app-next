import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { getAlternateLanguages } from "#/lib/i18n/get-alternate-languages.ts";
import { type Locale, locales } from "#/lib/i18n/locales.ts";
import { prefixes } from "#/lib/i18n/routing.ts";
import { getSiteMetadata, type SiteMetadata } from "#/lib/metadata/site-metadata.ts";
import type { Href } from "#/lib/navigation/href.ts";
import { getPathname } from "#/lib/navigation/navigation.ts";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

function toOpenGraphLocale(locale: Locale): string {
	return locale.replace("-", "_");
}

export const openGraphImage = { width: 1200, height: 630, type: "image/png" };

export function getDefaultOpenGraph(meta: SiteMetadata, locale: Locale): OpenGraph {
	return {
		type: "website",
		siteName: meta.title,
		title: meta.title,
		description: meta.description,
		locale: toOpenGraphLocale(locale),
		alternateLocale: locales
			.filter((alternate) => alternate !== locale)
			.map((alternate) => toOpenGraphLocale(alternate)),
		images: [
			{
				...openGraphImage,
				url: `${prefixes[locale]}/og-image`,
				alt: meta.title,
			},
		],
	};
}

interface CreatePageMetadataParams {
	href: Href;
	title?: string;
	description?: string;
	openGraph?: OpenGraph;
}

export async function createPageMetadata(params: Readonly<CreatePageMetadataParams>): Promise<Metadata> {
	const { href, title, description, openGraph } = params;

	const locale = await getLocale();
	const meta = await getSiteMetadata(locale);

	const canonical = getPathname({ locale, href });

	return {
		...(title != null && { title }),
		...(description != null && { description }),
		alternates: {
			canonical,
			languages: getAlternateLanguages(href),
		},
		openGraph: {
			...getDefaultOpenGraph(meta, locale),
			title: title ?? meta.title,
			description: description ?? meta.description,
			url: canonical,
			...openGraph,
		},
	};
}
