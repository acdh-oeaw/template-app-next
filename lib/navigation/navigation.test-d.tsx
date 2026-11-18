/**
 * Type tests for components and hooks which accept hrefs. Only type checked, not run, because `bun test` does not match
 * the file name.
 */

import { Link } from "#/components/link.tsx";
import { getPathname, redirect, useRouter } from "#/lib/i18n/navigation.ts";
import { externalHref, type Href, href, type RelativeHref } from "#/lib/navigation/href.ts";

declare const page: Href;
declare const relative: RelativeHref;
declare const either: Href | RelativeHref;

export const links = [
	<Link key="page" href={page} locale="de-AT">
		a
	</Link>,
	<Link key="relative" href={relative}>
		a
	</Link>,
	<Link key="either" href={either}>
		a
	</Link>,
	<Link key="external" href={externalHref("https://example.org")}>
		a
	</Link>,
	// @ts-expect-error -- plain strings
	<Link key="plain" href="https://example.org">
		a
	</Link>,
	// @ts-expect-error -- relative hrefs cannot be localized
	<Link key="relative-locale" href={relative} locale="de-AT">
		a
	</Link>,
	// @ts-expect-error -- relative hrefs cannot be localized
	<Link key="either-locale" href={either} locale="de-AT">
		a
	</Link>,
];

export function useRouterTypeTests(): void {
	const router = useRouter();

	router.push(page, { locale: "de-AT", scroll: false });
	router.push(relative, { scroll: false });
	router.replace(relative);
	router.prefetch(relative);
	// @ts-expect-error -- relative hrefs cannot be localized
	router.push(relative, { locale: "de-AT" });
	// @ts-expect-error -- plain strings
	router.push("/about");
}

export function navigationTypeTests(): void {
	getPathname({ href: href({ pathname: "/" }), locale: "de-AT" });
	// @ts-expect-error -- relative hrefs are not pages
	getPathname({ href: relative, locale: "de-AT" });
	// @ts-expect-error -- relative hrefs are not pages
	redirect({ href: relative, locale: "de-AT" });
}
