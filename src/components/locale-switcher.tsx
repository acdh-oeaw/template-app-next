import { useLocale, useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { LocaleSwitcherLink } from "@/components/locale-switcher-link";
import { type Locale, locales } from "~/config/i18n.config";

export function LocaleSwitcher(): ReactNode {
	const currentLocale = useLocale() as Locale;
	const t = useTranslations("LocaleSwitcher");

	return (
		<div className="flex items-center gap-2">
			{locales.map((locale) => {
				if (locale === currentLocale) {
					return (
						<span key={locale}>
							<span className="sr-only">
								{t("current-locale", { locale: t(`locales.${locale}`) })}
							</span>
							<span aria-hidden="true">{locale.toUpperCase()}</span>
						</span>
					);
				}

				return (
					<LocaleSwitcherLink key={locale} locale={locale}>
						<span className="sr-only">
							{t("switch-locale", { locale: t(`locales.${locale}`) })}
						</span>
						<span aria-hidden="true">{locale.toUpperCase()}</span>
					</LocaleSwitcherLink>
				);
			})}
		</div>
	);
}
