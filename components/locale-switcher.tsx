import { useTranslations } from "next-intl";
import { Fragment, type ReactNode, Suspense, useMemo } from "react";

import { LocaleSwitcherLink, LocaleSwitcherLinkFallback } from "@/components/locale-switcher-link";
import { locales } from "@/config/i18n.config";
import { useLocale } from "@/lib/navigation";

export function LocaleSwitcher(): ReactNode {
	const currentLocale = useLocale();
	const t = useTranslations("LocaleSwitcher");
	const labels = useMemo(() => {
		return new Intl.DisplayNames([currentLocale], { type: "language" });
	}, [currentLocale]);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (locales.length <= 1) return null;

	return (
		<div className="flex items-center gap-2">
			{locales.map((locale) => {
				if (locale === currentLocale) {
					return (
						<span key={locale}>
							<span className="sr-only">{t("current-locale", { locale: labels.of(locale) })}</span>
							<span aria-hidden={true}>{locale.toUpperCase()}</span>
						</span>
					);
				}

				const children = (
					<Fragment>
						<span className="sr-only">{t("switch-locale", { locale: labels.of(locale) })}</span>
						<span aria-hidden={true}>{locale.toUpperCase()}</span>
					</Fragment>
				);

				/**
				 * Suspense boundary is necessary to avoid client-side deoptimisation caused by `useSearchParams`.
				 *
				 * @see https://nextjs.org/docs/messages/deopted-into-client-rendering
				 */
				return (
					<Suspense
						key={locale}
						fallback={
							<LocaleSwitcherLinkFallback locale={locale}>{children}</LocaleSwitcherLinkFallback>
						}
					>
						<LocaleSwitcherLink locale={locale}>{children}</LocaleSwitcherLink>
					</Suspense>
				);
			})}
		</div>
	);
}
