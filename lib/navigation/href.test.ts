import { describe, expect, test } from "bun:test";

import {
	href as appHref,
	externalHref,
	type Href,
	type HrefFunction,
	type LocalizedRoutes,
	type RelativeHref,
	withSearchParams,
} from "#/lib/navigation/href.ts";

interface TestParamMap {
	"/[locale]": { locale: string };
	"/[locale]/about": { locale: string };
	"/[locale]/posts/[id]": { locale: string; id: string };
	"/[locale]/docs/[...path]": { locale: string; path: Array<string> };
	"/[locale]/search/[[...filters]]": { locale: string; filters?: Array<string> };
	"/api/health": Record<string, never>;
}

/** The implementation does not depend on the generated routes, only its types do. */
const href = appHref as unknown as HrefFunction<LocalizedRoutes<TestParamMap>>;

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

	test("throws for missing required params at runtime", () => {
		expect(() => href({ pathname: "/docs/[...path]", params: { path: [] } })).toThrow('Missing param "path"');
	});

	test("appends search params and hash", () => {
		expect<string>(
			href({ pathname: "/about", searchParams: { q: "a&b", tag: ["x", "y"], page: undefined }, hash: "team" }),
		).toBe("/about?q=a%26b&tag=x&tag=y#team");
		expect<string>(href({ pathname: "/about", searchParams: {} })).toBe("/about");
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

	test("throws for empty relative hrefs at runtime", () => {
		expect(() => href({ hash: "" })).toThrow("needs a `pathname`, `searchParams` or a `hash`");
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
	// @ts-expect-error -- route handlers are not pages
	href({ pathname: "/api/health" });
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
	// @ts-expect-error -- the href is not a plain string
	const value: Href = "/about";
	// @ts-expect-error -- relative hrefs are not pages
	const relative: Href = href({ hash: "x" });
	const page: Href = href({ pathname: "/about", hash: "x" });
	const current: RelativeHref = href({ searchParams: { page: "2" } });
	void [value, relative, page, current];
}
