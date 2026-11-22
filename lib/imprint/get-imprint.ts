import "server-only";

import { cacheLife } from "next/cache";

import { env } from "#/lib/env/server.ts";
import { getLanguage, type Locale } from "#/lib/i18n/locales.ts";

export class ImprintError extends Error {
	override name = "ImprintError";
}

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

	const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });

	if (!response.ok) {
		throw new ImprintError(`Failed to fetch the imprint: ${String(response.status)} ${response.statusText}`);
	}

	return response.text();
}
