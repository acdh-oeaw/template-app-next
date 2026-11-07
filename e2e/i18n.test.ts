import { expect } from "@playwright/test";

import { test } from "#/e2e/lib/fixtures.ts";

const pathnames = ["/en", "/en/imprint", "/de", "/de/imprint"];

function getPathname(url: string | null | undefined, baseURL: string | undefined): string | null {
	return url != null ? new URL(url, baseURL).pathname : null;
}

test.describe("canonical urls", () => {
	for (const pathname of pathnames) {
		test(`${pathname} links to itself`, async ({ baseURL, page }) => {
			const response = await page.goto(pathname);
			expect(response?.status()).toBe(200);

			const canonical = page.locator('head link[rel="canonical"]');
			await expect(canonical).toHaveCount(1);
			expect(getPathname(await canonical.getAttribute("href"), baseURL)).toBe(pathname);
		});
	}

	const redirects = [
		{ from: "/", to: "/en" },
		{ from: "/imprint", to: "/en/imprint" },
		{ from: "/en-GB", to: "/en/en-GB" },
		{ from: "/en-GB/imprint", to: "/en/en-GB/imprint" },
		{ from: "/de-AT/imprint", to: "/en/de-AT/imprint" },
	];

	for (const { from, to } of redirects) {
		test(`${from} redirects to ${to}`, async ({ baseURL, request }) => {
			const response = await request.get(from, { maxRedirects: 0 });
			expect(response.status()).toBe(307);
			expect(getPathname(response.headers().location, baseURL)).toBe(to);
		});
	}

	test("redirects to the preferred language", async ({ baseURL, request }) => {
		const response = await request.get("/imprint", { headers: { "Accept-Language": "de" }, maxRedirects: 0 });
		expect(response.status()).toBe(307);
		expect(getPathname(response.headers().location, baseURL)).toBe("/de/imprint");
	});

	test("internal locale redirects for rsc requests", async ({ baseURL, request }) => {
		const response = await request.get("/en-GB/imprint", { headers: { RSC: "1" }, maxRedirects: 0 });
		expect(response.status()).toBe(307);
		expect(getPathname(response.headers().location, baseURL)).toBe("/en/en-GB/imprint");
	});

	test("internal locale is not reachable", async ({ page }) => {
		const response = await page.goto("/en-GB/imprint");
		expect(response?.status()).toBe(404);
	});
});

test.describe("alternate links", () => {
	for (const pathname of pathnames) {
		const unprefixed = pathname.replace(/^\/(?:de|en)/, "");

		const alternates = {
			"en-GB": `/en${unprefixed}`,
			"de-AT": `/de${unprefixed}`,
			"x-default": `/en${unprefixed}`,
		};

		test(`${pathname} lists alternates in head`, async ({ baseURL, page }) => {
			await page.goto(pathname);

			await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(Object.keys(alternates).length);

			for (const [hreflang, expected] of Object.entries(alternates)) {
				const alternate = page.locator(`head link[rel="alternate"][hreflang="${hreflang}"]`);
				await expect(alternate).toHaveCount(1);

				const href = await alternate.getAttribute("href");
				expect(href).toMatch(/^https?:\/\//);
				expect(getPathname(href, baseURL)).toBe(expected);
			}
		});

		test(`${pathname} does not set alternates in link header`, async ({ request }) => {
			const response = await request.get(pathname);
			expect(response.headers().link ?? "").not.toContain('rel="alternate"');
		});
	}
});
