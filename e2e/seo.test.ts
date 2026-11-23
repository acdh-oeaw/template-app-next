import { expect, type Page, test } from "@playwright/test";

import { sitemapPages } from "#/e2e/pages.ts";

interface SitemapEntry {
	url: string;
	alternates: Record<string, string>;
}

/**
 * Parses with `DOMParser` rather than regexes, so invalid xml fails, and entities are decoded like in html attributes.
 *
 * @see {@link https://github.com/vercel/next.js/issues/77340}
 */
function parseSitemap(page: Page, xml: string) {
	return page.evaluate((xml) => {
		const sitemap = new DOMParser().parseFromString(xml, "application/xml");
		const error = sitemap.querySelector("parsererror")?.textContent ?? null;

		const entries = Array.from(sitemap.querySelectorAll("url"), (entry) => {
			const links = entry.querySelectorAll("link");

			return {
				url: entry.querySelector("loc")?.textContent ?? "",
				alternates: Object.fromEntries(
					Array.from(links, (link) => [link.getAttribute("hreflang") ?? "", link.getAttribute("href") ?? ""]),
				),
			};
		});

		return { error, entries };
	}, xml);
}

/** The proxy `matcher` must exclude `robots.txt` and `sitemap.xml`, so `maxRedirects: 0` also catches locale redirects. */
async function getSitemap(page: Page): Promise<Array<SitemapEntry>> {
	const response = await page.request.get("/sitemap.xml", { maxRedirects: 0 });
	expect(response.status()).toBe(200);

	const { error, entries } = await parseSitemap(page, await response.text());
	expect(error).toBeNull();

	return entries;
}

test.describe("robots.txt", () => {
	test("allows all crawlers", async ({ request }) => {
		const response = await request.get("/robots.txt", { maxRedirects: 0 });
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("text/plain");

		const robots = await response.text();
		expect(robots).toMatch(/^User-Agent: \*$/m);
		expect(robots).toMatch(/^Allow: \/$/m);
		expect(robots).not.toMatch(/^Disallow:/m);
	});

	test("links to the sitemap with an absolute url", async ({ request }) => {
		const response = await request.get("/robots.txt", { maxRedirects: 0 });
		const sitemap = /^Sitemap: (.+)$/m.exec(await response.text())?.[1];

		expect(sitemap).toMatch(/^https?:\/\//);
		expect(new URL(sitemap ?? "").pathname).toBe("/sitemap.xml");
	});
});

test.describe("sitemap.xml", () => {
	test("lists all pages in all locales", async ({ page }) => {
		const response = await page.request.get("/sitemap.xml", { maxRedirects: 0 });
		expect(response.headers()["content-type"]).toContain("application/xml");

		const entries = await getSitemap(page);
		const listed = entries.map((entry) => new URL(entry.url).pathname);

		expect(listed.toSorted()).toStrictEqual(sitemapPages.toSorted());
	});

	test("alternates are reciprocal", async ({ page }) => {
		const entries = await getSitemap(page);

		for (const entry of entries) {
			expect(Object.values(entry.alternates)).toContain(entry.url);

			for (const [hreflang, href] of Object.entries(entry.alternates)) {
				const alternate = entries.find((candidate) => candidate.url === href);

				expect(alternate, `${hreflang} alternate of ${entry.url}`).toBeDefined();
				expect(alternate?.alternates).toStrictEqual(entry.alternates);
			}
		}
	});

	for (const pathname of sitemapPages) {
		test(`${pathname} matches the page metadata`, async ({ page }) => {
			const entries = await getSitemap(page);
			const entry = entries.find((candidate) => new URL(candidate.url).pathname === pathname);

			const response = await page.goto(pathname);
			expect(response?.status()).toBe(200);
			expect(response?.request().redirectedFrom()).toBeNull();

			/**
			 * Compares the `href` properties, which normalize the urls, because Next.js renders the home page as the origin,
			 * without the trailing slash, which is the same url.
			 */
			const canonical = await page.locator('head link[rel="canonical"]').evaluate((link: HTMLLinkElement) => link.href);
			expect(canonical).toBe(entry?.url);
			await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);

			const alternates = await page
				.locator('head link[rel="alternate"][hreflang]')
				.evaluateAll((links: Array<HTMLLinkElement>) => links.map((link) => [link.hreflang, link.href]));

			expect(Object.fromEntries(alternates)).toStrictEqual(entry?.alternates);
		});
	}
});
