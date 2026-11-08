import { instant } from "@next/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";

function getLocaleLink(page: Page, name: string): Locator {
	return page
		.getByRole("banner")
		.getByRole("navigation", { name: /^(Language|Sprache)$/ })
		.getByRole("link", { name, exact: true });
}

test.describe("instant navigation", () => {
	test("page load shows the whole page in the static shell", async ({ page, baseURL }) => {
		await instant(
			page,
			async () => {
				await page.goto("/en/imprint");

				await expect(page.getByRole("banner")).toBeVisible();
				await expect(getLocaleLink(page, "Deutsch (German)")).toBeVisible();
				await expect(page.getByRole("heading", { level: 1, name: "Imprint" })).toBeVisible();
				await expect(page.getByRole("contentinfo")).toBeVisible();
			},
			{ baseURL },
		);
	});

	test("client navigation shows the destination page", async ({ page }) => {
		await page.goto("/en");

		await instant(page, async () => {
			await page.getByRole("contentinfo").getByRole("link", { name: "Imprint" }).click();
			await page.waitForURL((url) => {
				return url.pathname === "/en/imprint";
			});

			await expect(page.getByRole("heading", { level: 1, name: "Imprint" })).toBeVisible();
		});
	});

	test("switching the locale shows the destination page", async ({ page }) => {
		await page.goto("/en/imprint");

		await instant(page, async () => {
			await getLocaleLink(page, "Deutsch (German)").click();
			await page.waitForURL((url) => {
				return url.pathname === "/de/imprint";
			});

			await expect(page.getByRole("heading", { level: 1, name: "Impressum" })).toBeVisible();
		});
	});
});
