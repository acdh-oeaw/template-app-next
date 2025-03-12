import { useMessages } from "next-intl";
import { getMessages } from "next-intl/server";

import type { IntlLocale } from "@/lib/i18n/locales";

export async function getMetadata(locale?: IntlLocale) {
	const { metadata } = await getMessages({ locale });

	return metadata;
}

export function useMetadata() {
	const { metadata } = useMessages();

	return metadata;
}
