import { type Locale, localePrefix } from "@/config/i18n.config";

export function getLocalePrefix(locale: Locale) {
	const prefix = localePrefix.prefixes[locale];

	return prefix;
}
