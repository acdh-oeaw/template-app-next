import "server-only";

import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { formats, isValidLocale } from "@/config/i18n.config";

export default getRequestConfig(async ({ requestLocale }) => {
	const locale = await requestLocale;

	if (locale == null || !isValidLocale(locale)) notFound();

	const timeZone = "UTC";

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const _messages = await import(`@/messages/${locale}.json`);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const _metadata = await import(`@/content/${locale}/metadata/index.json`);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
	const messages = { metadata: _metadata.default, ..._messages.default } as IntlMessages;

	return {
		formats,
		messages,
		timeZone,
	};
});
