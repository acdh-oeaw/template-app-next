import { expect, type Locator, type Page, test } from "@playwright/test";

function getNavigation(page: Page, name: string): Locator {
	return page.getByRole("banner").getByRole("navigation", { name });
}

test.describe("main navigation", () => {
	test("is a labelled navigation landmark", async ({ page }) => {
		await page.goto("/en");

		await expect(getNavigation(page, "Main")).toBeVisible();
		await expect(getNavigation(page, "Main").getByRole("link")).toHaveText(["Home", "About"]);
	});

	test("is localized", async ({ page }) => {
		await page.goto("/de");

		await expect(getNavigation(page, "Hauptnavigation")).toBeVisible();
		await expect(getNavigation(page, "Hauptnavigation").getByRole("link")).toHaveText(["Startseite", "Über uns"]);
		await expect(getNavigation(page, "Hauptnavigation").getByRole("link", { name: "Über uns" })).toHaveAttribute(
			"href",
			"/de/about",
		);
	});

	test("marks the link to the current page", async ({ page }) => {
		await page.goto("/en/about");

		const navigation = getNavigation(page, "Main");

		await expect(navigation.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
		await expect(navigation.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
	});

	test("marks no link on pages outside the navigation", async ({ page }) => {
		await page.goto("/en/imprint");

		const navigation = getNavigation(page, "Main");

		await expect(navigation.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
		await expect(navigation.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
	});

	test("updates the current link after client navigation", async ({ page }) => {
		await page.goto("/en");

		const navigation = getNavigation(page, "Main");

		await expect(navigation.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");

		await navigation.getByRole("link", { name: "About" }).click();
		await expect(page).toHaveURL(/\/en\/about$/);
		await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();

		await expect(navigation.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
		await expect(navigation.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
	});
});
