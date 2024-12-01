import { type NextRequest, NextResponse } from "next/server";

import type { Locale } from "@/config/i18n.config";
import { createFeed } from "@/lib/create-feed";

export const dynamicParams = false;

interface Context {
	params: {
		locale: Locale;
	};
}

export async function GET(request: NextRequest, context: Context): Promise<NextResponse> {
	const { params } = context;

	const { locale } = params;

	const feed = await createFeed(locale);

	return new NextResponse(feed, { headers: { "content-type": "application/xml" } });
}
