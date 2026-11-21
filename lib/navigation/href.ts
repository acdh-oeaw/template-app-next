import type { AnySearchParamsCodec, EncodedSearchParams } from "#/lib/navigation/search-params.ts";

declare const brand: unique symbol;

/**
 * A pathname of a page in this app, without the locale prefix, optionally with search params and a hash. Components and
 * functions that navigate require it instead of a plain string.
 *
 * The brand reads as the type error for plain strings.
 */
export type Href = string & { readonly [brand]: "Create internal hrefs with href() from #/lib/navigation/href.ts" };

/**
 * Search params or a hash, relative to the current page, like `?page=2` or `#comments`. Only for links, because it
 * cannot be localized, and is not a page for metadata or redirects.
 */
export type RelativeHref = string & {
	readonly [brand]: "Create relative hrefs with href({ searchParams, hash }) from #/lib/navigation/href.ts";
};

/** An absolute url, like `https://example.org` or `mailto:info@example.org`. */
export type ExternalHref = string & {
	readonly [brand]: "Create external hrefs with externalHref() from #/lib/navigation/href.ts";
};

/** Any href that `<Link>` accepts, like for components that render a link, or data that mixes pages and external urls. */
export type AnyHref = ExternalHref | Href | RelativeHref;

type SegmentParams = Record<string, string | ReadonlyArray<string> | undefined>;

/**
 * Strips the segment of the root param, and drops routes outside of it, which the navigation wrappers could not prefix.
 * With `never`, keeps all routes unchanged.
 */
type RouteBelow<TRoute extends string, TRootParam extends string> = [TRootParam] extends [never]
	? TRoute
	: TRoute extends `/[${TRootParam}]${infer TPathname}`
		? TPathname extends ""
			? "/"
			: TPathname
		: never;

/** A page in the `RouteRegistry` that our Next.js patch generates: its params, and its `search-params.ts` module. */
interface RouteRegistryEntry {
	params: object;
	searchParams?: unknown;
}

type CodecOf<TEntry> = TEntry extends { searchParams: { searchParamsCodec: infer TCodec extends AnySearchParamsCodec } }
	? TCodec
	: never;

/**
 * Maps page routes below the segment of a root param, like `[locale]`, to their params, without the root param, and to
 * the codec of their `search-params.ts`, which is `never` without one. With `never` as the root param, maps all routes.
 * Generic, so tests can use other routes.
 */
export type RoutesBelow<
	TRegistry extends { [TRoute in keyof TRegistry]: RouteRegistryEntry },
	TRootParam extends string,
> = {
	[TRoute in keyof TRegistry & string as RouteBelow<TRoute, TRootParam>]: {
		params: Omit<TRegistry[TRoute]["params"], TRootParam>;
		codec: CodecOf<TRegistry[TRoute]>;
	};
};

interface RouteEntry {
	params: object;
	codec: AnySearchParamsCodec;
}

/**
 * Reports a `search-params.ts` without a `searchParamsCodec` export, or one not created with
 * `createSearchParamsCodec()`. The registry is generated in a `.d.ts` file, where `skipLibCheck` skips the check.
 */
type CheckRouteRegistry<
	TRegistry extends {
		[TRoute in keyof TRegistry]: { params: object; searchParams?: { searchParamsCodec: AnySearchParamsCodec } };
	},
> = TRegistry;

/**
 * Pages below `[locale]`, because `next-intl` adds the locale prefix back. Not all root params from `next/root-params`:
 * other root segments stay part of the route, with their params. Without i18n routing, use `never`.
 */
export type Routes = RoutesBelow<CheckRouteRegistry<RouteRegistry>, "locale">;

export type Route = keyof Routes;

/** Routes without params, like `/about`. */
export type StaticRoute = { [TRoute in Route]: keyof Routes[TRoute]["params"] extends never ? TRoute : never }[Route];

export type SearchParams = Record<string, string | ReadonlyArray<string> | undefined>;

/** Required catch-all segments need at least one item. Arrays can be readonly. */
type SegmentParam<TValue> = undefined extends TValue
	? Exclude<TValue, undefined> extends Array<string>
		? ReadonlyArray<string> | undefined
		: TValue
	: TValue extends Array<string>
		? readonly [string, ...Array<string>]
		: TValue;

type SegmentParamsOf<TParams> = { readonly [TKey in keyof TParams]: SegmentParam<TParams[TKey]> };

type ParamsOption<TParams> = keyof TParams extends never
	? { params?: never }
	: Partial<TParams> extends TParams
		? { params?: SegmentParamsOf<TParams> }
		: { params: SegmentParamsOf<TParams> };

/** Pages with a `search-params.ts` only accept search params encoded by its codec, other pages accept any. */
type SearchParamsOption<TCodec extends AnySearchParamsCodec> = [TCodec] extends [never]
	? { searchParams?: Readonly<SearchParams> }
	: { searchParams?: EncodedSearchParams<TCodec> };

type RouteHrefOptions<TRoutes extends { [TRoute in keyof TRoutes]: RouteEntry }> = {
	[TRoute in keyof TRoutes & string]: { pathname: TRoute } & ParamsOption<TRoutes[TRoute]["params"]> &
		SearchParamsOption<TRoutes[TRoute]["codec"]> & { hash?: string };
}[keyof TRoutes & string];

type RelativeHrefOptions = {
	pathname?: never;
	params?: never;
} & ({ searchParams: Readonly<SearchParams>; hash?: string } | { searchParams?: never; hash: string });

/** The route overload is last, because type errors are reported for the last overload. */
export interface HrefFunction<TRoutes extends { [TRoute in keyof TRoutes]: RouteEntry }> {
	(options: Readonly<RelativeHrefOptions>): RelativeHref;
	(options: Readonly<RouteHrefOptions<TRoutes>>): Href;
}

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

		const parts: ReadonlyArray<string> = typeof value === "string" ? [value] : value;

		if (parts.includes("")) {
			throw new Error(`Param "${name}" for route "${route}" must not be empty.`);
		}

		/** Browsers resolve these as relative segments, also percent-encoded, like `/posts/..` to `/`. */
		if (parts.includes(".") || parts.includes("..")) {
			throw new Error(`Param "${name}" for route "${route}" must not be "." or "..".`);
		}

		if (catchAll == null && parts.length > 1) {
			throw new Error(`Param "${name}" for route "${route}" must be a single segment.`);
		}

		return parts.map((part) => encodeURIComponent(part));
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
 *
 * Pages with a `search-params.ts` only accept search params from `encodeSearchParams()` with its codec.
 *
 * Without a pathname, creates an href relative to the current page, like `href({ hash: "comments" })`. Search params
 * replace the current ones, so empty search params remove them.
 */
export function href(options: Readonly<RelativeHrefOptions>): RelativeHref;
export function href(options: Readonly<RouteHrefOptions<Routes>>): Href;
export function href(options: Readonly<RelativeHrefOptions | RouteHrefOptions<Routes>>): Href | RelativeHref {
	const { pathname, params, searchParams, hash } = options as {
		pathname?: string;
		params?: SegmentParams;
		searchParams?: Readonly<SearchParams>;
		hash?: string;
	};

	let value = pathname != null ? interpolate(pathname, params ?? {}) : "";

	if (searchParams != null) {
		/** A relative href needs the "?" to remove the current search params, a pathname alone already does. */
		value += toSearch(searchParams) || (pathname == null ? "?" : "");
	}

	if (hash != null) {
		if (hash === "" || hash.startsWith("#")) {
			throw new Error(`Invalid hash "${hash}": expected a non-empty fragment without the leading "#".`);
		}

		value += `#${encodeURIComponent(hash)}`;
	}

	if (value === "") {
		throw new Error("`href()` needs a `pathname`, `searchParams` or a `hash`.");
	}

	return value as Href | RelativeHref;
}

/** Adds search params to an href, like the current search params to the href of the current page. */
export function withSearchParams(value: Href, searchParams: URLSearchParams): Href {
	const url = new URL(value, "http://localhost");

	for (const [key, item] of searchParams) {
		url.searchParams.append(key, item);
	}

	return `${url.pathname}${url.search}${url.hash}` as Href;
}

const externalProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

/** Checks that a url is absolute, and that its protocol is safe to link to, unlike `javascript:` or `data:`. */
export function externalHref(value: string | URL): ExternalHref {
	let url: URL;

	try {
		url = new URL(value);
	} catch {
		throw new TypeError(
			`Invalid external href "${String(value)}": expected an absolute url, like "https://example.org". Use \`href()\` for pages of this app.`,
		);
	}

	if (!externalProtocols.has(url.protocol)) {
		throw new TypeError(
			`Invalid external href "${String(value)}": expected one of the protocols ${Array.from(externalProtocols).join(", ")}.`,
		);
	}

	/** Strings are kept as they are, because the `URL` serialization can differ, like a trailing slash. */
	return (typeof value === "string" ? value : url.href) as ExternalHref;
}

/**
 * Marks a string as an href without checking it. Only use this for values which are known to be pathnames of this app,
 * like the result of `usePathname()`.
 */
export function unsafeHref(value: string): Href {
	return value as Href;
}
