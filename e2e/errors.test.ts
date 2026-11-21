import { AxeBuilder } from "@axe-core/playwright";
import { type BrowserContext, expect, test } from "@playwright/test";

const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/** The fixtures throw unless this cookie is set, so tests can recover with "Try again". */
async function fixRequestTimeError(context: BrowserContext, baseURL: string | undefined): Promise<void> {
	await context.addCookies([{ name: "e2e-error", value: "off", url: baseURL }]);
}

test.describe("error page", () => {
	test("replaces the page content after a request-time error", async ({ page }) => {
		await page.goto("/en/e2e/error");

		const main = page.getByRole("main");

		await expect(main.getByRole("heading", { level: 1, name: "Something went wrong" })).toBeVisible();
		await expect(main.getByText(/^Error reference: \S+$/)).toBeVisible();
		await expect(main.getByRole("heading", { level: 1, name: "Error", exact: true })).toHaveCount(0);
		await expect(page).toHaveTitle("Something went wrong");
	});

	test("is localized", async ({ page }) => {
		await page.goto("/de/e2e/error");

		await expect(page.getByRole("heading", { level: 1, name: "Etwas ist schiefgelaufen" })).toBeVisible();
		await expect(page).toHaveTitle("Etwas ist schiefgelaufen");
	});

	test("recovers with “Try again”", async ({ baseURL, context, page }) => {
		await page.goto("/en/e2e/error");
		await expect(page.getByRole("heading", { level: 1, name: "Something went wrong" })).toBeVisible();

		await fixRequestTimeError(context, baseURL);
		await page.getByRole("button", { name: "Try again" }).click();

		await expect(page.getByRole("heading", { level: 1, name: "Error", exact: true })).toBeVisible();
		await expect(page.getByRole("main").getByText("Content", { exact: true })).toBeVisible();
		await expect(page.getByRole("heading", { name: "Something went wrong" })).toHaveCount(0);
	});

	test("has no detectable accessibility violations", async ({ page }) => {
		await page.goto("/en/e2e/error");
		await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();

		const results = await new AxeBuilder({ page }).withTags(tags).analyze();

		expect(results.violations).toStrictEqual([]);
	});
});

test.describe("error boundary", () => {
	test("only replaces the failing part of the page", async ({ page }) => {
		await page.goto("/en/e2e/error-boundary");

		const main = page.getByRole("main");
		const alert = main.getByRole("alert");

		await expect(main.getByRole("heading", { level: 1, name: "Error boundary" })).toBeVisible();
		await expect(alert.getByText("An unexpected error occurred.")).toBeVisible();
		await expect(alert.getByText(/^Error reference: \S+$/)).toBeVisible();
	});

	test("recovers with “Try again”", async ({ baseURL, context, page }) => {
		await page.goto("/en/e2e/error-boundary");

		/** Not `page.getByRole("alert")`, which also matches the route announcer of Next.js. */
		const main = page.getByRole("main");

		await expect(main.getByRole("alert")).toBeVisible();

		await fixRequestTimeError(context, baseURL);
		await main.getByRole("button", { name: "Try again" }).click();

		await expect(main.getByText("Content", { exact: true })).toBeVisible();
		await expect(main.getByRole("alert")).toHaveCount(0);
	});

	test("has no detectable accessibility violations", async ({ page }) => {
		await page.goto("/en/e2e/error-boundary");
		await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();

		const results = await new AxeBuilder({ page }).withTags(tags).analyze();

		expect(results.violations).toStrictEqual([]);
	});
});
