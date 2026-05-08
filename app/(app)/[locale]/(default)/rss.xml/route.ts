import { notFound } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

import { isValidLocale } from "#/lib/i18n/locales";
import { createFeed } from "#/lib/rss/create-feed";

export const dynamic = "force-static";

interface Context extends RouteContext<"/[locale]/rss.xml"> {}

export async function GET(request: NextRequest, context: Context): Promise<NextResponse> {
	const { params } = context;

	// FIXME: use `root-params` once available upstream.
	const { locale } = await params;
	if (!isValidLocale(locale)) {
		notFound();
	}

	const feed = await createFeed(locale);

	return new NextResponse(feed, { headers: { "content-type": "application/rss+xml" } });
}
