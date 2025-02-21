import "server-only";

import { getRequestConfig } from "next-intl/server";

import { defaultLocale, formats, isValidLocale } from "@/config/i18n.config";
import { getI18nMessages } from "@/lib/i18n/get-messages";

export default getRequestConfig(async ({ requestLocale }) => {
	const _locale = await requestLocale;
	const locale = isValidLocale(_locale) ? _locale : defaultLocale;

	const timeZone = "UTC";
	const messages = await getI18nMessages(locale);

	return {
		formats,
		locale,
		messages,
		timeZone,
	};
});
