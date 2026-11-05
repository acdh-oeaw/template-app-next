import { expect, type Page, test } from "@playwright/test";

import de from "#/content/de/metadata.json";
import en from "#/content/en/metadata.json";

const locales = [
	{ prefix: "/en", lang: "en-GB", og: "en_GB", alternate: "de_AT", meta: en, imprint: "Imprint" },
	{ prefix: "/de", lang: "de-AT", og: "de_AT", alternate: "en_GB", meta: de, imprint: "Impressum" },
];

function getMeta(page: Page, key: string) {
	return page.locator(`head meta[name="${key}"], head meta[property="${key}"]`);
}

for (const { prefix, lang, og, alternate, meta, imprint } of locales) {
	test.describe(`metadata for ${lang}`, () => {
		test("index page uses the site title", async ({ page }) => {
			await page.goto(prefix);

			await expect(page).toHaveTitle(meta.title);
			await expect(getMeta(page, "og:title")).toHaveAttribute("content", meta.title);
		});

		test("imprint page uses the title template", async ({ page }) => {
			await page.goto(`${prefix}/imprint`);

			await expect(page).toHaveTitle(`${imprint} | ${meta.title}`);
			await expect(getMeta(page, "og:title")).toHaveAttribute("content", imprint);
		});

		for (const pathname of [prefix, `${prefix}/imprint`]) {
			test(`${pathname} is localized`, async ({ baseURL, page }) => {
				await page.goto(pathname);

				await expect(page.locator("html")).toHaveAttribute("lang", lang);
				await expect(getMeta(page, "description")).toHaveAttribute("content", meta.description);
				await expect(getMeta(page, "og:description")).toHaveAttribute("content", meta.description);
				await expect(getMeta(page, "og:site_name")).toHaveAttribute("content", meta.title);
				await expect(getMeta(page, "og:locale")).toHaveAttribute("content", og);
				await expect(getMeta(page, "og:locale:alternate")).toHaveAttribute("content", alternate);

				const url = await getMeta(page, "og:url").getAttribute("content");
				expect(url).toMatch(/^https?:\/\//);
				expect(new URL(url ?? "", baseURL).pathname).toBe(pathname);
				expect(url).toBe(await page.locator('head link[rel="canonical"]').getAttribute("href"));
			});
		}
	});
}

test("manifest uses the default locale", async ({ request }) => {
	const response = await request.get("/manifest.webmanifest");
	expect(response.status()).toBe(200);

	expect(await response.json()).toMatchObject({
		name: en.manifest.name,
		short_name: en.manifest.shortName,
		description: en.description,
		start_url: "/en",
	});
});
