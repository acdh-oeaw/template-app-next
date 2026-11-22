import "server-only";

import { cacheLife } from "next/cache";

import { env } from "#/lib/env/server.ts";
import { getLanguage, type Locale } from "#/lib/i18n/locales.ts";
import { request } from "#/lib/request/request.ts";

/** @see {@link https://github.com/acdh-oeaw/imprint-service} */
export async function getImprint(locale: Locale): Promise<string> {
	"use cache";

	cacheLife("days");

	const url = new URL(env.SERVICE_ID, "https://imprint.acdh.oeaw.ac.at/");
	url.searchParams.set("locale", getLanguage(locale));

	/** Returns the default imprint, without querying Redmine for the service's configuration. */
	if (process.env.NODE_ENV === "development") {
		url.searchParams.set("redmine", "disabled");
	}

	const { data } = await request(url, { responseType: "text", retries: 2 });

	return data;
}
