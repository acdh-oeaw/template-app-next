/**
 * Type tests for components and hooks which accept hrefs, and for the routes that our Next.js patch generates. Only
 * type checked, not run, because `bun test` does not match the file name.
 */

import { searchParamsCodec } from "#/app/[locale]/e2e/search-params/search-params.ts";
import { Link } from "#/components/link.tsx";
import { type AnyHref, externalHref, type Href, href, type RelativeHref, type Route } from "#/lib/navigation/href.ts";
import { useRouter } from "#/lib/navigation/navigation-hooks.ts";
import { getPathname, redirect } from "#/lib/navigation/navigation.ts";
import { createSearchParamsCodec, encodeSearchParams, searchParam } from "#/lib/navigation/search-params.ts";

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

declare const any: AnyHref;

/** Components that render a link can pass on any href, but not localize it. */
export const anyHrefLinks = [
	<Link key="any" href={any}>
		a
	</Link>,
	// @ts-expect-error -- relative and external hrefs cannot be localized
	<Link key="any-locale" href={any} locale="de-AT">
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

/** Fails without the generated `RouteRegistry`, so that `bun check` reports a missing or broken patch. */
export function routeRegistryTypeTests(): void {
	const route: Route = "/e2e/search-params";
	// @ts-expect-error -- unknown route
	const unknown: Route = "/does-not-exist";

	href({ pathname: "/e2e/search-params", searchParams: encodeSearchParams(searchParamsCodec, { page: 2 }) });
	// @ts-expect-error -- pages with a `search-params.ts` only accept search params encoded by its codec
	href({ pathname: "/e2e/search-params", searchParams: { page: "2" } });

	const otherCodec = createSearchParamsCodec({ page: searchParam.number() });
	// @ts-expect-error -- search params encoded by the codec of another page
	href({ pathname: "/e2e/search-params", searchParams: encodeSearchParams(otherCodec, { page: 2 }) });

	void [route, unknown];
}
