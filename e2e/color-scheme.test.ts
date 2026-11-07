import { expect, type Page, test } from "@playwright/test";

const storageKey = "color-scheme";

function getRadio(page: Page, name: string) {
	return page.getByRole("radio", { name, exact: true });
}

async function select(page: Page, name: string): Promise<void> {
	await expect(getRadio(page, name)).toBeEnabled();
	/** The input is visually hidden, so click the label like a user. */
	await page.getByRole("radiogroup").getByText(name, { exact: true }).click();
	await expect(getRadio(page, name)).toBeChecked();
}

test.describe("color scheme", () => {
	test.use({ colorScheme: "dark" });

	test("follows the system preference by default", async ({ page }) => {
		await page.goto("/en");

		await expect(getRadio(page, "System")).toBeChecked();
		await expect(page.locator("html")).not.toHaveAttribute("data-color-scheme");

		const isDark = await page.evaluate(() => {
			return matchMedia("(prefers-color-scheme: dark)").matches;
		});
		expect(isDark).toBe(true);
	});

	test("overrides the system preference, and persists", async ({ page }) => {
		await page.goto("/en");
		await select(page, "Light");

		await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
		await expect(page.locator("html")).toHaveCSS("color-scheme", "light");

		await page.reload();

		await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
		await expect(getRadio(page, "Light")).toBeChecked();
	});

	test("goes back to the system preference", async ({ page }) => {
		await page.goto("/en");
		await select(page, "Light");
		await select(page, "System");

		await expect(page.locator("html")).not.toHaveAttribute("data-color-scheme");
		const stored = await page.evaluate((key) => {
			return localStorage.getItem(key);
		}, storageKey);
		expect(stored).toBeNull();
	});

	test("is applied without client-side javascript bundles", async ({ page }) => {
		await page.addInitScript((key) => {
			localStorage.setItem(key, "light");
		}, storageKey);
		await page.route("**/_next/static/**/*.js", (route) => {
			return route.abort();
		});

		await page.goto("/en");

		await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
	});

	test("ignores invalid stored values", async ({ page }) => {
		await page.addInitScript((key) => {
			localStorage.setItem(key, "invalid");
		}, storageKey);

		await page.goto("/en");

		await expect(getRadio(page, "System")).toBeChecked();
		await expect(page.locator("html")).not.toHaveAttribute("data-color-scheme");
	});

	test("syncs between tabs", async ({ context, page }) => {
		const other = await context.newPage();
		await other.goto("/en");
		await expect(getRadio(other, "System")).toBeChecked();

		await page.goto("/en");
		await select(page, "Light");

		await expect(other.locator("html")).toHaveAttribute("data-color-scheme", "light");
		await expect(getRadio(other, "Light")).toBeChecked();
	});

	test("survives client-side navigation between locales", async ({ page }) => {
		await page.goto("/en");
		await select(page, "Light");

		await page.evaluate(() => {
			(window as unknown as { next: { router: { push: (href: string) => void } } }).next.router.push("/de");
		});

		await expect(page.locator("html")).toHaveAttribute("lang", /^de/);
		await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
	});

	test("is applied on not-found pages, which are rendered on the client", async ({ page }) => {
		await page.addInitScript((key) => {
			localStorage.setItem(key, "light");
		}, storageKey);

		await page.goto("/en/does-not-exist");

		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
	});

	test("logs no errors", async ({ page }) => {
		const errors: Array<string> = [];
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
		page.on("pageerror", (error) => {
			errors.push(error.message);
		});

		await page.goto("/en");
		await select(page, "Dark");

		expect(errors).toEqual([]);
	});
});
