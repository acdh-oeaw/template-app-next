import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { defaultLocale, type Locale, locales } from "#/lib/i18n/locales.ts";
import { getPathname } from "#/lib/i18n/navigation.ts";
import { getSiteMetadata, type SiteMetadata } from "#/lib/metadata/site-metadata.ts";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

type Href = Parameters<typeof getPathname>[0]["href"];

function toOpenGraphLocale(locale: Locale): string {
	return locale.replace("-", "_");
}

export function getDefaultOpenGraph(meta: SiteMetadata, locale: Locale): OpenGraph {
	return {
		type: "website",
		siteName: meta.title,
		title: meta.title,
		description: meta.description,
		locale: toOpenGraphLocale(locale),
		alternateLocale: locales
			.filter((alternate) => {
				return alternate !== locale;
			})
			.map(toOpenGraphLocale),
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

	const languages: Record<string, string> = {};
	for (const alternate of locales) {
		languages[alternate] = getPathname({ locale: alternate, href });
	}
	languages["x-default"] = getPathname({ locale: defaultLocale, href });

	return {
		...(title != null ? { title } : {}),
		...(description != null ? { description } : {}),
		alternates: {
			canonical,
			languages,
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
