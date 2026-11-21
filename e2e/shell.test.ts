import { expect, test } from "@playwright/test";

import de from "#/content/de/metadata.json";

test.describe("app shell", () => {
	for (const pathname of ["/en", "/en/imprint", "/en/does-not-exist", "/de", "/de/imprint"]) {
		test(`${pathname} has a header and footer`, async ({ page }) => {
			await page.goto(pathname);

			await expect(page.getByRole("banner")).toBeVisible();
			await expect(page.getByRole("main")).toBeVisible();
			await expect(page.getByRole("contentinfo")).toBeVisible();
		});
	}

	test("footer stays at the bottom of short pages", async ({ page }) => {
		await page.goto("/en");

		const box = await page.getByRole("contentinfo").boundingBox();
		const viewport = page.viewportSize();

		expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(viewport?.height);
	});

	test("links navigate within the current locale", async ({ page }) => {
		await page.goto("/de");

		await page.getByRole("contentinfo").getByRole("link", { name: "Impressum" }).click();
		await expect(page).toHaveURL(/\/de\/imprint$/);
		await expect(page.getByRole("heading", { level: 1, name: "Impressum" })).toBeVisible();

		await page.getByRole("banner").getByRole("link", { name: "ACDH-App" }).click();
		await expect(page).toHaveURL(/\/de$/);
		await expect(page.getByRole("banner").getByRole("link", { name: "ACDH-App" })).toBeVisible();
		/**
		 * Only fails sometimes without the fix, when the navigation starts before the page has hydrated.
		 *
		 * @see {@link https://github.com/facebook/react/pull/37814}
		 */
		await expect(page.getByRole("contentinfo")).toBeVisible();

		await page.getByRole("contentinfo").getByRole("link", { name: "Erklärung zur Barrierefreiheit" }).click();
		await expect(page).toHaveURL(/\/de\/accessibility$/);
		await expect(page.getByRole("heading", { level: 1, name: "Erklärung zur Barrierefreiheit" })).toBeVisible();
	});

	test("footer links to the social media profiles", async ({ page }) => {
		await page.goto("/de");

		const links = page.getByRole("contentinfo").getByRole("list", { name: "Soziale Medien" }).getByRole("link");

		await expect(links).toHaveCount(de.social.length);

		for (const [index, { href }] of de.social.entries()) {
			await expect(links.nth(index)).toHaveAttribute("href", href);
			await expect(links.nth(index)).toHaveAccessibleName(/\S/);
		}
	});
});
