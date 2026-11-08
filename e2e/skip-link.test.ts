import { expect, type Page, test } from "@playwright/test";

function getSkipLink(page: Page) {
	return page.getByRole("link", { name: "Skip to main content" });
}

async function activateSkipLink(page: Page): Promise<void> {
	await getSkipLink(page).focus();
	await page.keyboard.press("Enter");
}

test.describe("skip link", () => {
	test("is the first focusable element", async ({ page }) => {
		await page.goto("/en");
		await page.keyboard.press("Tab");

		await expect(getSkipLink(page)).toBeFocused();
	});

	test("is only visible when focused", async ({ page }) => {
		await page.goto("/en");

		const hidden = await getSkipLink(page).boundingBox();
		expect(hidden?.width).toBeLessThanOrEqual(1);

		await getSkipLink(page).focus();

		const focused = await getSkipLink(page).boundingBox();
		expect(focused?.width).toBeGreaterThan(1);
	});

	test("does not shift the layout when focused", async ({ page }) => {
		await page.goto("/en");

		const before = await page.getByRole("banner").boundingBox();
		await getSkipLink(page).focus();
		const after = await page.getByRole("banner").boundingBox();

		expect(after).toEqual(before);
	});

	test("moves focus to the main content", async ({ page }) => {
		await page.goto("/en");
		await activateSkipLink(page);

		await expect(page.getByRole("main")).toBeFocused();
	});

	test("is translated", async ({ page }) => {
		await page.goto("/de");

		await expect(page.getByRole("link", { name: "Zum Hauptinhalt springen" })).toBeAttached();
	});

	test("works on not-found pages", async ({ page }) => {
		await page.goto("/en/does-not-exist");
		await activateSkipLink(page);

		await expect(page.getByRole("main")).toBeFocused();
	});

	/** With `cacheComponents`, previous pages stay in the DOM, with the same `id` on their hidden main content. */
	test("targets the visible page after client-side navigation", async ({ page }) => {
		await page.goto("/en");

		await page.getByRole("contentinfo").getByRole("link", { name: "Imprint" }).click();
		await expect(page.getByRole("heading", { level: 1, name: "Imprint" })).toBeVisible();
		await activateSkipLink(page);
		await expect(page.getByRole("main")).toBeFocused();

		await page.getByRole("banner").getByRole("link", { name: "ACDH App" }).click();
		await expect(page.getByRole("heading", { level: 1, name: "Hello, World!" })).toBeVisible();
		await activateSkipLink(page);
		await expect(page.getByRole("main")).toBeFocused();
	});
});
