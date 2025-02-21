import { useLocale } from "next-intl";

import type { Language } from "@/config/i18n.config";

export function useLanguage(): Language {
	const locale = useLocale();

	const language = new Intl.Locale(locale).language as Language;

	return language;
}
