import { getLocale } from "next-intl/server";

import type { Language } from "@/config/i18n.config";

export async function getLanguage(): Promise<Language> {
	const locale = await getLocale();

	const language = new Intl.Locale(locale).language as Language;

	return language;
}
