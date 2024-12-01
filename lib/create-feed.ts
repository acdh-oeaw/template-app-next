import { createUrl } from "@acdh-oeaw/lib";
import { type Entry, rss } from "xast-util-feed";
import { toXml } from "xast-util-to-xml";

import { env } from "@/config/env.config";
import type { IntlLocale } from "@/lib/i18n/locales";
import { getMetadata } from "@/lib/i18n/metadata";

const baseUrl = env.NEXT_PUBLIC_APP_BASE_URL;

export async function createFeed(locale: IntlLocale) {
	"use cache";

	const meta = await getMetadata(locale);

	const channel = {
		title: meta.title,
		url: baseUrl,
		feedUrl: String(createUrl({ baseUrl, pathname: `/${locale}/rss.xml` })),
		lang: locale,
	};

	const entries: Array<Entry> = [];

	const feed = toXml(rss(channel, entries));

	return feed;
}
