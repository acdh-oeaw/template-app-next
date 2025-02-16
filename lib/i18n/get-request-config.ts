import "server-only";

import { getRequestConfig } from "next-intl/server";

import { defaultLocale, formats, isValidLocale, type Locale } from "@/config/i18n.config";
import type metadataDe from "@/content/de/metadata/index.json";
import type metadataEn from "@/content/en/metadata/index.json";
import type de from "@/messages/de.json";
import type en from "@/messages/en.json";

export type Messages = typeof en & { metadata: typeof metadataEn };

export interface Translations extends Record<Locale, Messages> {
	de: typeof de & { metadata: typeof metadataDe };
	en: typeof en & { metadata: typeof metadataEn };
}

export default getRequestConfig(async ({ requestLocale }) => {
	const _locale = await requestLocale;
	const locale = _locale == null || !isValidLocale(_locale) ? defaultLocale : _locale;

	const timeZone = "UTC";

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const _messages = await import(`@/messages/${locale}.json`);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const _metadata = await import(`@/content/${locale}/metadata/index.json`);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
	const messages = { metadata: _metadata.default, ..._messages.default } as Messages;

	return {
		formats,
		locale,
		messages,
		timeZone,
	};
});
