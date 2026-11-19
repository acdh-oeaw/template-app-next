import { describe, expect, test } from "bun:test";

import * as v from "valibot";

import {
	href as appHref,
	externalHref,
	type Href,
	type HrefFunction,
	type LocalizedRoutes,
	type RelativeHref,
	withSearchParams,
} from "#/lib/navigation/href.ts";
import { createSearchParamsCodec, encodeSearchParams, searchParam } from "#/lib/navigation/search-params.ts";

const resultsCodec = createSearchParamsCodec({
	q: searchParam.string(),
	page: searchParam.number(v.pipe(v.number(), v.integer(), v.minValue(1)), { default: 1 }),
	tag: searchParam.array(searchParam.string()),
});

const tagCodec = createSearchParamsCodec({ sort: searchParam.string(v.picklist(["new", "old"])) });

/** Like the `RouteRegistry` that our Next.js patch generates. */
interface TestRegistry {
	"/[locale]": { params: { locale: string } };
	"/[locale]/about": { params: { locale: string } };
	"/[locale]/posts/[id]": { params: { locale: string; id: string } };
	"/[locale]/docs/[...path]": { params: { locale: string; path: Array<string> } };
	"/[locale]/search/[[...filters]]": { params: { locale: string; filters?: Array<string> } };
	"/[locale]/results": { params: { locale: string }; searchParams: { searchParamsCodec: typeof resultsCodec } };
	"/[locale]/tags/[tag]": {
		params: { locale: string; tag: string };
		searchParams: { searchParamsCodec: typeof tagCodec };
	};
	"/health": { params: Record<string, never> };
}

/** The implementation does not depend on the generated routes, only its types do. */
const href = appHref as unknown as HrefFunction<LocalizedRoutes<TestRegistry>>;

describe("href", () => {
	test("strips the locale segment from static routes", () => {
		expect<string>(href({ pathname: "/" })).toBe("/");
		expect<string>(href({ pathname: "/about" })).toBe("/about");
	});

	test("interpolates and encodes dynamic segments", () => {
		expect<string>(href({ pathname: "/posts/[id]", params: { id: "a b/c" } })).toBe("/posts/a%20b%2Fc");
	});

	test("interpolates catch-all segments", () => {
		expect<string>(href({ pathname: "/docs/[...path]", params: { path: ["guides", "getting started"] } })).toBe(
			"/docs/guides/getting%20started",
		);
	});

	test("omits empty optional catch-all segments", () => {
		expect<string>(href({ pathname: "/search/[[...filters]]" })).toBe("/search");
		expect<string>(href({ pathname: "/search/[[...filters]]", params: { filters: [] } })).toBe("/search");
		expect<string>(href({ pathname: "/search/[[...filters]]", params: { filters: ["a", "b"] } })).toBe("/search/a/b");
	});

	test("accepts readonly arrays for catch-all segments", () => {
		const path: ReadonlyArray<string> = ["a", "b"];

		expect<string>(href({ pathname: "/search/[[...filters]]", params: { filters: path } })).toBe("/search/a/b");
		expect<string>(href({ pathname: "/docs/[...path]", params: { path: ["a", "b"] as const } })).toBe("/docs/a/b");
	});

	test("throws for missing or empty params at runtime", () => {
		// @ts-expect-error -- required catch-all segments need at least one item
		expect(() => href({ pathname: "/docs/[...path]", params: { path: [] } })).toThrow('Missing param "path"');
		expect(() => href({ pathname: "/posts/[id]", params: { id: "" } })).toThrow('Param "id" for route');
		expect(() => href({ pathname: "/docs/[...path]", params: { path: ["a", ""] } })).toThrow("must not be empty");
	});

	test("throws for dot segment params, which browsers would resolve", () => {
		expect(() => href({ pathname: "/posts/[id]", params: { id: ".." } })).toThrow('must not be "." or ".."');
		expect(() => href({ pathname: "/docs/[...path]", params: { path: ["a", "."] } })).toThrow(
			'must not be "." or ".."',
		);
		expect<string>(href({ pathname: "/posts/[id]", params: { id: "..." } })).toBe("/posts/...");
		expect<string>(href({ pathname: "/posts/[id]", params: { id: ".well-known" } })).toBe("/posts/.well-known");
	});

	test("appends search params and hash", () => {
		expect<string>(
			href({ pathname: "/about", searchParams: { q: "a&b", tag: ["x", "y"], page: undefined }, hash: "team" }),
		).toBe("/about?q=a%26b&tag=x&tag=y#team");
		expect<string>(href({ pathname: "/about", searchParams: {} })).toBe("/about");
	});

	test("appends search params encoded by the codec of pages with a search-params.ts", () => {
		expect<string>(
			href({
				pathname: "/results",
				searchParams: encodeSearchParams(resultsCodec, { q: "a b", page: 2, tag: ["x", "y"] }),
			}),
		).toBe("/results?q=a+b&page=2&tag=x&tag=y");
		expect<string>(href({ pathname: "/results", searchParams: encodeSearchParams(resultsCodec, { page: 1 }) })).toBe(
			"/results",
		);
		expect<string>(href({ pathname: "/results" })).toBe("/results");
		expect<string>(
			href({
				pathname: "/tags/[tag]",
				params: { tag: "a" },
				searchParams: encodeSearchParams(tagCodec, { sort: "new" }),
			}),
		).toBe("/tags/a?sort=new");
	});

	test("creates hrefs relative to the current page", () => {
		expect<string>(href({ hash: "main-content" })).toBe("#main-content");
		expect<string>(href({ searchParams: { page: "2" } })).toBe("?page=2");
		expect<string>(href({ searchParams: { page: "2" }, hash: "results" })).toBe("?page=2#results");
	});

	test("removes the current search params with empty search params", () => {
		expect<string>(href({ searchParams: {} })).toBe("?");
		expect<string>(href({ searchParams: { page: undefined }, hash: "results" })).toBe("?#results");
	});

	test("throws for empty hashes, and hashes with a leading #", () => {
		expect(() => href({ hash: "" })).toThrow('Invalid hash ""');
		expect(() => href({ hash: "#comments" })).toThrow('without the leading "#"');
		expect(() => href({ pathname: "/about", hash: "" })).toThrow('Invalid hash ""');
	});

	test("rejects invalid routes and params at compile time", () => {
		expect(hrefTypeTests).toBeFunction();
	});
});

describe("withSearchParams", () => {
	test("adds search params to an href", () => {
		expect<string>(withSearchParams(href({ pathname: "/about" }), new URLSearchParams("q=a+b&tag=x"))).toBe(
			"/about?q=a+b&tag=x",
		);
		expect<string>(withSearchParams(href({ pathname: "/about" }), new URLSearchParams())).toBe("/about");
	});

	test("keeps existing search params and hash", () => {
		const value = href({
			pathname: "/posts/[id]",
			params: { id: "a b" },
			searchParams: { page: "2" },
			hash: "comments",
		});

		expect<string>(withSearchParams(value, new URLSearchParams("sort=new"))).toBe(
			"/posts/a%20b?page=2&sort=new#comments",
		);
	});
});

describe("externalHref", () => {
	test("accepts absolute urls with a safe protocol", () => {
		expect<string>(externalHref("https://example.org")).toBe("https://example.org");
		expect<string>(externalHref("mailto:info@example.org")).toBe("mailto:info@example.org");
		expect<string>(externalHref("tel:+431234")).toBe("tel:+431234");
		expect<string>(externalHref(new URL("https://example.org/a?b=c"))).toBe("https://example.org/a?b=c");
	});

	test("rejects relative urls, and points to href()", () => {
		expect(() => externalHref("/about")).toThrow("Use `href()` for pages of this app.");
		expect(() => externalHref("example.org")).toThrow('expected an absolute url, like "https://example.org"');
	});

	test("rejects unsafe protocols", () => {
		expect(() => externalHref("javascript:alert(1)")).toThrow("expected one of the protocols");
		expect(() => externalHref("data:text/html,hi")).toThrow("expected one of the protocols");
	});
});

/** Only type checked, not run. */
function hrefTypeTests() {
	// @ts-expect-error -- unknown route
	href({ pathname: "/does-not-exist" });
	// @ts-expect-error -- the locale is added by `<Link>`
	href({ pathname: "/[locale]/about" });
	// @ts-expect-error -- pages outside of `[locale]` have no localized href
	href({ pathname: "/health" });
	// @ts-expect-error -- missing params
	href({ pathname: "/posts/[id]" });
	// @ts-expect-error -- wrong param name
	href({ pathname: "/posts/[id]", params: { slug: "1" } });
	// @ts-expect-error -- static routes have no params
	href({ pathname: "/about", params: { id: "1" } });
	// @ts-expect-error -- params need a pathname
	href({ params: { id: "1" }, hash: "x" });
	// @ts-expect-error -- needs a pathname, search params or a hash
	href({});
	// @ts-expect-error -- plain records for a page with a search-params.ts
	href({ pathname: "/results", searchParams: { page: "2" } });
	// @ts-expect-error -- search params encoded by the codec of another page
	href({ pathname: "/results", searchParams: encodeSearchParams(tagCodec, { sort: "new" }) });
	const tags: ReadonlyArray<string> = ["x"];
	// pages without a search-params.ts accept any search params
	href({ pathname: "/about", searchParams: { other: "1", list: tags } });
	// relative hrefs do not know the current page, so they accept any search params
	href({ searchParams: { other: "1" } });
	href({ searchParams: encodeSearchParams(resultsCodec, { page: 2 }) });
	// @ts-expect-error -- the href is not a plain string
	const value: Href = "/about";
	// @ts-expect-error -- relative hrefs are not pages
	const relative: Href = href({ hash: "x" });
	const page: Href = href({ pathname: "/about", hash: "x" });
	const current: RelativeHref = href({ searchParams: { page: "2" } });
	void [value, relative, page, current];
}
