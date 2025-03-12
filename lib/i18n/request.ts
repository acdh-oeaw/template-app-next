import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { formats } from "@/lib/i18n/formats";
import { getIntlMessages } from "@/lib/i18n/messages";
import { routing } from "@/lib/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
	const requestedLocale = await requestLocale;
	const locale = hasLocale(routing.locales, requestedLocale)
		? requestedLocale
		: routing.defaultLocale;
	const messages = await getIntlMessages(locale);
	const timeZone = "UTC";

	return {
		formats,
		locale,
		messages,
		timeZone,
	};
});
