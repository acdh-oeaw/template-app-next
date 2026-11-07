"use client";

import { useExtracted as useTranslations, useLocale } from "next-intl";
import type { ReactNode } from "react";

import { type Locale, locales } from "#/lib/i18n/locales.ts";
import { getPathname, usePathname } from "#/lib/i18n/navigation.ts";

const labels: Record<Locale, string> = {
	"de-AT": "Deutsch",
	"en-GB": "English",
};

/**
 * Uses plain links, because a client-side navigation to another locale replaces `<html>`, which would discard what
 * `ColorSchemeScript` has set. The proxy remembers the language with the `NEXT_LOCALE` cookie.
 */
export function LocaleSwitcher(): ReactNode {
	const t = useTranslations();
	const currentLocale = useLocale();
	const pathname = usePathname();

	return (
		<nav aria-label={t("Language")}>
			<ul className="flex gap-2">
				{locales.map((locale) => {
					return (
						<li key={locale}>
							<a
								aria-current={locale === currentLocale ? "true" : undefined}
								className="aria-[current]:font-bold"
								href={getPathname({ locale, href: pathname })}
								hrefLang={locale}
								lang={locale}
							>
								{labels[locale]}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
