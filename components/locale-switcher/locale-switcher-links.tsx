"use client";

import { useExtracted as useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Fragment, type ReactNode, Suspense, useEffect, useRef } from "react";

import { Link } from "#/components/link.tsx";
import { getLanguage, type Locale, locales } from "#/lib/i18n/locales.ts";
import { usePathname } from "#/lib/i18n/navigation.ts";

/**
 * Each locale is named in its own language, so these are not translated. Not derived with `Intl.DisplayNames`, which
 * uses mid-sentence casing for some languages, like "français".
 */
const labels: Record<Locale, string> = {
	"de-AT": "Deutsch",
	"en-GB": "English",
};

type Glosses = Record<Locale, string | undefined>;

/**
 * Switching the locale replaces the root layout, so the focused link disappears, and browsers continue keyboard
 * navigation from the end of the document. Instead, focus moves to the link of the new locale, like on navigations
 * within a locale, where the header and its focused link are kept.
 *
 * Module state survives client navigations. Without client-side javascript, switching is a full page load.
 */
let pendingFocusLocale: Locale | null = null;

function useRestoreFocus(currentLocale: Locale) {
	const ref = useRef<HTMLAnchorElement>(null);

	useEffect(() => {
		if (pendingFocusLocale !== currentLocale) {
			return;
		}

		pendingFocusLocale = null;
		ref.current?.focus();
	}, [currentLocale]);

	return ref;
}

interface LocaleLinksProps {
	glosses: Glosses;
	href: string;
}

function LocaleLinks(props: Readonly<LocaleLinksProps>): ReactNode {
	const { glosses, href } = props;

	const t = useTranslations();
	const currentLocale = useLocale();
	const currentLinkRef = useRestoreFocus(currentLocale);

	return (
		<nav aria-label={t("Language")}>
			<ul className="flex gap-2">
				{locales.map((locale) => {
					const gloss = glosses[locale];
					const isCurrent = locale === currentLocale;

					return (
						<li key={locale}>
							<Link
								ref={isCurrent ? currentLinkRef : undefined}
								aria-current={isCurrent ? "page" : undefined}
								className="block aria-[current=page]:underline"
								href={href}
								locale={locale}
								onClick={() => {
									if (!isCurrent) {
										pendingFocusLocale = locale;
									}
								}}
							>
								<span lang={getLanguage(locale)}>{labels[locale]}</span>
								{gloss != null ? <Fragment> ({gloss})</Fragment> : null}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

interface LocaleLinksWithSearchParamsProps {
	glosses: Glosses;
	pathname: string;
}

function LocaleLinksWithSearchParams(props: Readonly<LocaleLinksWithSearchParamsProps>): ReactNode {
	const { glosses, pathname } = props;

	const search = useSearchParams().toString();

	return <LocaleLinks glosses={glosses} href={search !== "" ? `${pathname}?${search}` : pathname} />;
}

interface LocaleLinksWithPathnameProps {
	glosses: Glosses;
}

function LocaleLinksWithPathname(props: Readonly<LocaleLinksWithPathnameProps>): ReactNode {
	const { glosses } = props;

	const pathname = usePathname();

	return (
		<Suspense fallback={<LocaleLinks glosses={glosses} href={pathname} />}>
			<LocaleLinksWithSearchParams glosses={glosses} pathname={pathname} />
		</Suspense>
	);
}

interface LocaleSwitcherLinksProps {
	glosses: Glosses;
}

/**
 * Search params are never known when prerendering, so the prerendered html links to the current pathname, and search
 * params are added in the browser. This keeps pages static, and the links work before hydration.
 *
 * The pathname is known when prerendering, except for dynamic params missing from `generateStaticParams`. These need
 * their own boundary, because `usePathname` would suspend in the fallback of the inner boundary, and fail the build.
 */
export function LocaleSwitcherLinks(props: Readonly<LocaleSwitcherLinksProps>): ReactNode {
	const { glosses } = props;

	return (
		<Suspense fallback={<LocaleLinks glosses={glosses} href="/" />}>
			<LocaleLinksWithPathname glosses={glosses} />
		</Suspense>
	);
}
