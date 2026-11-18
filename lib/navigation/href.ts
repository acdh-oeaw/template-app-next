import type { AppRoutes, ParamMap } from "#/.next/types/routes.d.ts";

declare const brand: unique symbol;

/**
 * A pathname of a page in this app, without the locale prefix, optionally with search params and a hash. Components and
 * functions that navigate require it instead of a plain string.
 *
 * The brand reads as the type error for plain strings.
 */
export type Href = string & { readonly [brand]: "Create internal hrefs with href() from #/lib/navigation/href.ts" };

type SegmentParams = Record<string, string | Array<string> | undefined>;

/** Maps page routes below `[locale]` to their params, without the locale. Generic, so tests can use other routes. */
export type LocalizedRoutes<TParamMap> = {
	[
		TRoute in keyof TParamMap & string as TRoute extends `/[locale]${infer TPathname}`
			? TPathname extends ""
				? "/"
				: TPathname
			: never
	]: Omit<TParamMap[TRoute], "locale">;
};

export type Routes = LocalizedRoutes<Pick<ParamMap, AppRoutes>>;

export type Route = keyof Routes;

export type SearchParams = Record<string, string | ReadonlyArray<string> | undefined>;

type ParamsOption<TParams> = keyof TParams extends never
	? { params?: never }
	: Partial<TParams> extends TParams
		? { params?: Readonly<TParams> }
		: { params: Readonly<TParams> };

type RouteHrefOptions<TRoutes> = {
	[TRoute in keyof TRoutes & string]: { pathname: TRoute } & ParamsOption<TRoutes[TRoute]> & {
			searchParams?: Readonly<SearchParams>;
			hash?: string;
		};
}[keyof TRoutes & string];

export type HrefFunction<TRoutes> = (options: Readonly<RouteHrefOptions<TRoutes>>) => Href;

const dynamicSegment = /^\[(?<optional>\[)?(?<catchAll>\.{3})?(?<name>[^\]]+)\]\]?$/;

function interpolate(route: string, params: SegmentParams): string {
	const segments = route.split("/").flatMap((segment) => {
		const match = dynamicSegment.exec(segment);

		if (match?.groups == null) {
			return [segment];
		}

		const { optional, catchAll, name } = match.groups as { optional?: string; catchAll?: string; name: string };
		const value = params[name];

		if (value == null || (Array.isArray(value) && value.length === 0)) {
			if (optional != null) {
				return [];
			}

			throw new Error(`Missing param "${name}" for route "${route}".`);
		}

		if (catchAll != null) {
			return (Array.isArray(value) ? value : [value]).map((part) => encodeURIComponent(part));
		}

		return [encodeURIComponent(String(value))];
	});

	const pathname = segments.join("/");

	return pathname === "" ? "/" : pathname;
}

function toSearch(searchParams: Readonly<SearchParams>): string {
	const search = new URLSearchParams();

	for (const [key, value] of Object.entries(searchParams)) {
		if (value == null) {
			continue;
		}

		for (const item of typeof value === "string" ? [value] : value) {
			search.append(key, item);
		}
	}

	const query = search.toString();

	return query !== "" ? `?${query}` : "";
}

/**
 * Creates the href of a page, like `href({ pathname: "/posts/[id]", params: { id } })`. Pathnames are the page routes
 * that `next typegen` generates, without the `[locale]` segment, which `<Link>` and `redirect()` add.
 */
export const href: HrefFunction<Routes> = (options) => {
	const { pathname, params, searchParams, hash } = options as {
		pathname: string;
		params?: SegmentParams;
		searchParams?: Readonly<SearchParams>;
		hash?: string;
	};

	let value = interpolate(pathname, params ?? {});

	if (searchParams != null) {
		value += toSearch(searchParams);
	}

	if (hash != null && hash !== "") {
		value += `#${encodeURIComponent(hash)}`;
	}

	return value as Href;
};

/** Adds search params to an href, like the current search params to the href of the current page. */
export function withSearchParams(value: Href, searchParams: URLSearchParams): Href {
	const url = new URL(value, "http://localhost");

	for (const [key, item] of searchParams) {
		url.searchParams.append(key, item);
	}

	return `${url.pathname}${url.search}${url.hash}` as Href;
}

/**
 * Marks a string as an href without checking it. Only use this for values which are known to be pathnames of this app,
 * like the result of `usePathname()`.
 */
export function unsafeHref(value: string): Href {
	return value as Href;
}
