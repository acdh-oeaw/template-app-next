import { type APIRequestContext, expect, test } from "@playwright/test";

const pathnames = ["/en", "/en/about", "/en/imprint", "/de", "/de/about", "/de/imprint"];

interface SitemapEntry {
	url: string;
	alternates: Record<string, string>;
}

function parseSitemap(xml: string): Array<SitemapEntry> {
	return Array.from(xml.matchAll(/<url>(.*?)<\/url>/gs), ([, entry = ""]) => {
		const links = entry.matchAll(/<xhtml:link rel="alternate" hreflang="(.*?)" href="(.*?)"/g);

		return {
			url: /<loc>(.*?)<\/loc>/.exec(entry)?.[1] ?? "",
			alternates: Object.fromEntries(
				Array.from(links, ([, hreflang = "", href = ""]) => {
					return [hreflang, href];
				}),
			),
		};
	});
}

/** The proxy `matcher` must exclude `robots.txt` and `sitemap.xml`, so `maxRedirects: 0` also catches locale redirects. */
async function getSitemap(request: APIRequestContext): Promise<Array<SitemapEntry>> {
	const response = await request.get("/sitemap.xml", { maxRedirects: 0 });
	expect(response.status()).toBe(200);

	return parseSitemap(await response.text());
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
	test("lists all pages in all locales", async ({ request }) => {
		const response = await request.get("/sitemap.xml", { maxRedirects: 0 });
		expect(response.headers()["content-type"]).toContain("application/xml");

		const entries = await getSitemap(request);
		const listed = entries.map((entry) => {
			return new URL(entry.url).pathname;
		});

		expect(listed.toSorted()).toEqual(pathnames.toSorted());
	});

	test("alternates are reciprocal", async ({ request }) => {
		const entries = await getSitemap(request);

		for (const entry of entries) {
			expect(Object.values(entry.alternates)).toContain(entry.url);

			for (const [hreflang, href] of Object.entries(entry.alternates)) {
				const alternate = entries.find((candidate) => {
					return candidate.url === href;
				});

				expect(alternate, `${hreflang} alternate of ${entry.url}`).toBeDefined();
				expect(alternate?.alternates).toEqual(entry.alternates);
			}
		}
	});

	for (const pathname of pathnames) {
		test(`${pathname} matches the page metadata`, async ({ page, request }) => {
			const entries = await getSitemap(request);
			const entry = entries.find((candidate) => {
				return new URL(candidate.url).pathname === pathname;
			});

			const response = await page.goto(pathname);
			expect(response?.status()).toBe(200);
			expect(response?.request().redirectedFrom()).toBeNull();

			await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", entry?.url ?? "");
			await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);

			const alternates = await page.locator('head link[rel="alternate"][hreflang]').evaluateAll((links) => {
				return links.map((link) => {
					return [link.getAttribute("hreflang"), link.getAttribute("href")];
				});
			});

			expect(Object.fromEntries(alternates)).toEqual(entry?.alternates);
		});
	}
});
