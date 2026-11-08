import { useLocale } from "next-intl";
import type { ReactNode } from "react";

import { LocaleSwitcherLinks } from "#/components/locale-switcher/locale-switcher-links.tsx";
import { getLanguage, type Locale, locales } from "#/lib/i18n/locales.ts";

/**
 * Language names in the current locale, shown next to each name in its own language, so that e.g. "日本語" can be
 * recognised as "Japanese". Computed on the server, because the browser's ICU data may differ and break hydration.
 */
function getGlosses(currentLocale: Locale): Record<Locale, string | undefined> {
	const displayNames = new Intl.DisplayNames(currentLocale, { type: "language" });

	return Object.fromEntries(
		locales.map((locale) => {
			return [locale, locale !== currentLocale ? displayNames.of(getLanguage(locale)) : undefined];
		}),
	) as Record<Locale, string | undefined>;
}

export function LocaleSwitcher(): ReactNode {
	const locale = useLocale();

	return <LocaleSwitcherLinks glosses={getGlosses(locale)} />;
}
