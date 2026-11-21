import { AxeBuilder } from "@axe-core/playwright";
import { type BrowserContext, expect, type Page, test } from "@playwright/test";

const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/** The fixtures throw unless this cookie is set, so tests can recover with "Try again". */
async function fixRequestTimeError(context: BrowserContext, baseURL: string | undefined): Promise<void> {
	await context.addCookies([{ name: "e2e-error", value: "off", url: baseURL }]);
}

const colorSchemeStorageKey = "color-scheme";

async function storeColorScheme(page: Page, colorScheme: "dark" | "light"): Promise<void> {
	await page.addInitScript(
		({ key, value }) => {
			localStorage.setItem(key, value);
		},
		{ key: colorSchemeStorageKey, value: colorScheme },
	);
}

test.describe("not-found page", () => {
	test.describe("for unmatched urls below a locale prefix", () => {
		test("responds with 404", async ({ page }) => {
			const response = await page.goto("/en/does-not-exist");

			expect(response?.status()).toBe(404);
			await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
			await expect(page).toHaveTitle(/^Page not found \| /);
		});

		test.describe("without javascript", () => {
			test.use({ javaScriptEnabled: false });

			test("is server-rendered", async ({ page }) => {
				await page.goto("/en/does-not-exist");

				await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
				await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
			});
		});
	});

	test.describe("for pages calling notFound()", () => {
		test("responds with 404", async ({ page }) => {
			const response = await page.goto("/en/e2e/not-found");

			expect(response?.status()).toBe(404);
			await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
		});

		test("is localized", async ({ page }) => {
			await page.goto("/de/e2e/not-found");

			await expect(page.locator("html")).toHaveAttribute("lang", "de-AT");
			await expect(
				page.getByRole("main").getByRole("heading", { level: 1, name: "Seite nicht gefunden" }),
			).toBeVisible();
		});

		test("applies the stored color scheme", async ({ page }) => {
			await storeColorScheme(page, "light");

			await page.goto("/en/e2e/not-found");

			await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
			await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
		});

		test.describe("without javascript", () => {
			test.use({ javaScriptEnabled: false });

			/** @see {@link https://github.com/vercel/next.js/issues/99287} */
			test.fail("is server-rendered", async ({ page }) => {
				await page.goto("/en/e2e/not-found");

				await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
				await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
			});
		});
	});

	/**
	 * Locales the proxy skips, like `/x.png`, render the default not-found page of Next.js, because `notFound()` in the
	 * root layout does not render `global-not-found.tsx`.
	 *
	 * @see {@link https://github.com/vercel/next.js/issues/85446}
	 */
	test.describe("for invalid locales", () => {
		test.fail("responds with 404", async ({ page }) => {
			const response = await page.goto("/x.png");

			expect(response?.status()).toBe(404);
			await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
		});

		test.fail("applies the stored color scheme", async ({ page }) => {
			await storeColorScheme(page, "light");

			await page.goto("/x.png");

			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
		});
	});

	test.describe("for internal locales", () => {
		test("redirects to the language prefix, then responds with 404", async ({ baseURL, page }) => {
			const response = await page.goto("/en-GB");

			expect(response?.url()).toBe(new URL("/en/en-GB", baseURL).href);
			expect(response?.status()).toBe(404);
			await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
		});
	});
});

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
