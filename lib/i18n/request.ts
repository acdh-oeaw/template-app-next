import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import * as rootParams from "next/root-params";

import { timeZone } from "#/lib/i18n/locales.ts";
import { getMessages } from "#/lib/i18n/messages.ts";
import { routing } from "#/lib/i18n/routing.ts";

/**
 * Falls back to the default locale instead of calling `notFound()`, because `global-not-found.tsx` has no root param,
 * but renders components that read the locale from here. The locale layout responds with 404 for invalid locales.
 * `next/root-params` throws in route handlers and server actions, so pass the locale explicitly there.
 */
export default getRequestConfig(async (params) => {
	const requested = params.locale ?? (await rootParams.locale());
	const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

	const messages = await getMessages(locale);

	return {
		locale,
		messages,
		timeZone,
	};
});
