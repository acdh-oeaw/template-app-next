import { getMessages } from "next-intl/server";

import type { Locale } from "@/config/i18n.config";

export async function getMetadata(locale?: Locale) {
	const messages = (await getMessages({ locale })) as unknown as IntlMessages;

	const metadata = messages.metadata;

	const social: Record<string, string> = {};
	messages.metadata.social.forEach((entry) => {
		social[entry.kind] = entry.href;
	});

	return { ...metadata, social };
}
