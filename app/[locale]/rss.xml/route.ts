import { type NextRequest, NextResponse } from "next/server";

import { createFeed } from "@/lib/create-feed";
import type { IntlLocale } from "@/lib/i18n/locales";

interface Context {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function GET(request: NextRequest, context: Context): Promise<NextResponse> {
	const { params } = context;

	const { locale } = await params;

	const feed = await createFeed(locale);

	return new NextResponse(feed, { headers: { "content-type": "application/rss+xml" } });
}
