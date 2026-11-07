import { expect, test } from "@playwright/test";

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

		await page.getByRole("banner").getByRole("link").click();
		await expect(page).toHaveURL(/\/de$/);
		await expect(page.getByRole("banner").getByRole("link")).toBeVisible();
	});
});
