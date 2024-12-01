import { expect, test } from "@/e2e/lib/test";
import { locales } from "@/lib/i18n/locales";

test("should serve an open-graph image", async ({ createIndexPage, request }) => {
	for (const locale of locales) {
		const { indexPage } = await createIndexPage(locale);
		await indexPage.goto();

		const url = await indexPage.page
			.locator('link[rel="alternate"][type="application/rss+xml"]')
			.getAttribute("href");
		expect(url).toContain(`/${locale}/rss.xml`);

		const response = await request.get(String(url));
		const status = response.status();
		const contentType = response.headers()["content-type"];

		expect(status).toBe(200);
		expect(contentType).toBe("application/rss+xml");
	}
});
