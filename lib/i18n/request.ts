import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import * as rootParams from "next/root-params";

import { timeZone } from "#/configs/i18n.config.ts";
import { getMessages } from "#/lib/i18n/messages.ts";
import { routing } from "#/lib/i18n/routing.ts";

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
