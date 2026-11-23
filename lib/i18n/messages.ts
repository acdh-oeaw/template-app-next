import type { AbstractIntlMessages } from "next-intl";

import { getLanguage, type Locale } from "#/lib/i18n/locales.ts";

export async function getMessages(locale: Locale): Promise<AbstractIntlMessages> {
	/** @see {@link https://github.com/vercel/next.js/issues/97533} */
	const { default: messages } = (await import(`../../messages/${getLanguage(locale)}.po`)) as {
		default: AbstractIntlMessages;
	};

	return messages;
}
