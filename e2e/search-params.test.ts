import { expect, type Locator, type Page, test } from "@playwright/test";

function getPagination(page: Page): Locator {
	return page.getByRole("main").getByRole("navigation", { name: "Pagination" });
}

test.describe("search params", () => {
	test("are decoded with the codec in search-params.ts", async ({ page }) => {
		await page.goto("/en/e2e/search-params?q=+vienna+&page=2&other=1");

		await expect(page.getByRole("main").getByText("Results for “vienna”, page 2")).toBeVisible();
		await expect(page.getByRole("searchbox", { name: "Search term" })).toHaveValue("vienna");
	});

	for (const search of ["q=vienna&page=abc", "q=vienna&page=0", "q=vienna&page=1&page=2"]) {
		test(`fall back to the default of invalid values, for ${search}`, async ({ page }) => {
			await page.goto(`/en/e2e/search-params?${search}`);

			await expect(
				page.getByRole("main").getByText("Some search parameters are invalid and were ignored."),
			).toBeVisible();
			await expect(page.getByRole("main").getByText("Results for “vienna”, page 1")).toBeVisible();
		});
	}

	test("ignore an invalid query, and keep the page", async ({ page }) => {
		await page.goto("/en/e2e/search-params?q=a&q=b");

		await expect(
			page.getByRole("main").getByText("Some search parameters are invalid and were ignored."),
		).toBeVisible();
		await expect(page.getByRole("searchbox", { name: "Search term" })).toHaveValue("");
		await expect(page.getByRole("main").getByText(/^Results for/)).toBeHidden();
	});

	test("are encoded into localized links by href(), without defaults", async ({ page }) => {
		await page.goto("/de/e2e/search-params?q=wien&page=2");

		await expect(getPagination(page).getByRole("link", { name: "Previous page" })).toHaveAttribute(
			"href",
			"/de/e2e/search-params?q=wien",
		);
		await expect(getPagination(page).getByRole("link", { name: "Next page" })).toHaveAttribute(
			"href",
			"/de/e2e/search-params?q=wien&page=3",
		);
	});
});
