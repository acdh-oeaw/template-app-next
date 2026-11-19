import { describe, expect, test } from "bun:test";

import { getAriaCurrent } from "#/lib/navigation/get-aria-current.ts";
import type { Href } from "#/lib/navigation/href.ts";

function check(pathname: string, href: string) {
	return getAriaCurrent(pathname as Href, href as Href);
}

describe("getAriaCurrent", () => {
	test("marks links to the current page", () => {
		expect(check("/about", "/about")).toBe("page");
		expect(check("/", "/")).toBe("page");
	});

	test("ignores search params and the hash of the link", () => {
		expect(check("/search", "/search?q=a")).toBe("page");
		expect(check("/about", "/about#team")).toBe("page");
	});

	test("marks links to an ancestor, but not the home page", () => {
		expect(check("/posts/1", "/posts")).toBe("true");
		expect(check("/posts/1", "/posts?page=2")).toBe("true");
		expect(check("/about", "/")).toBeUndefined();
	});

	test("does not mark links to other pages", () => {
		expect(check("/about", "/imprint")).toBeUndefined();
		expect(check("/postscript", "/posts")).toBeUndefined();
	});
});
