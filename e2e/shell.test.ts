import { expect, type Page } from "@playwright/test";

import en from "#/content/en/metadata.json";
import { test } from "#/e2e/lib/fixtures.ts";

function getHeading(page: Page) {
	return page.getByRole("heading", { level: 1 });
}

function getBackground(page: Page) {
	return page.locator("html").evaluate(() => {
		return getComputedStyle(document.body).backgroundColor;
	});
}

/** Clicks the label like a user would, because the radio input is visually hidden. */
async function selectColorScheme(page: Page, name: string) {
	await expect(page.getByRole("radio", { name })).toBeEnabled();

	await page.getByRole("radiogroup").getByText(name, { exact: true }).click();

	await expect(page.getByRole("radio", { name })).toBeChecked();
}

test.describe("landmarks", () => {
	for (const pathname of ["/en", "/de/imprint", "/en/does-not-exist", "/x.png"]) {
		test(`${pathname} has a header, main content and footer`, async ({ page }) => {
			await page.goto(pathname);

			await expect(page.getByRole("banner")).toBeVisible();
			await expect(page.getByRole("main")).toBeVisible();
			await expect(page.getByRole("contentinfo")).toBeVisible();
		});
	}

	test.describe("without javascript", () => {
		test.use({ javaScriptEnabled: false });

		test("the shell is server-rendered", async ({ page }) => {
			await page.goto("/en/imprint");

			await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Home" })).toBeVisible();
			await expect(
				page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "Deutsch" }),
			).toBeVisible();
			await expect(page.getByRole("contentinfo").getByRole("link", { name: "Imprint" })).toBeVisible();
			await expect(page.getByRole("radio", { name: "Dark" })).toBeDisabled();
		});
	});
});

test.describe("skip link", () => {
	test("is the first focusable element and moves focus to the main content", async ({ page }) => {
		await page.goto("/en");
		await expect(getHeading(page)).toBeVisible();

		await page.keyboard.press("Tab");

		const skipLink = page.getByRole("link", { name: "Skip to main content" });
		await expect(skipLink).toBeFocused();
		await expect(skipLink).toBeInViewport();

		await page.keyboard.press("Enter");

		await expect(page.getByRole("main")).toBeFocused();
	});

	test("is translated", async ({ page }) => {
		await page.goto("/de");

		await expect(page.getByRole("link", { name: "Zum Hauptinhalt springen" })).toBeAttached();
	});
});

test.describe("navigation", () => {
	test("navigates without a full page load", async ({ page }) => {
		await page.goto("/en");
		await page.evaluate(() => {
			Object.assign(window, { __marker: true });
		});

		const navigation = page.getByRole("navigation", { name: "Main" });
		await expect(navigation.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");

		await navigation.getByRole("link", { name: "Imprint" }).click();
		await page.waitForURL((url) => {
			return url.pathname === "/en/imprint";
		});

		await expect(getHeading(page)).toHaveText("Imprint");
		await expect(page).toHaveTitle(`Imprint | ${en.title}`);
		await expect(navigation.getByRole("link", { name: "Imprint" })).toHaveAttribute("aria-current", "page");
		await expect(navigation.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
		expect(await page.evaluate(() => "__marker" in window)).toBe(true);
	});

	test("supports the back and forward buttons", async ({ page }) => {
		await page.goto("/en");
		await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Imprint" }).click();
		await expect(getHeading(page)).toHaveText("Imprint");

		await page.goBack();
		await expect(getHeading(page)).toHaveText("Hello, World!");
		await expect(page).toHaveTitle(en.title);

		await page.goForward();
		await expect(getHeading(page)).toHaveText("Imprint");
	});
});

test.describe("locale switcher", () => {
	test("stays on the current page", async ({ page }) => {
		await page.goto("/en/imprint");

		const switcher = page.getByRole("navigation", { name: "Language" });
		await expect(switcher.getByRole("link", { name: "English" })).toHaveAttribute("aria-current", "true");

		await switcher.getByRole("link", { name: "Deutsch" }).click();
		await page.waitForURL((url) => {
			return url.pathname === "/de/imprint";
		});

		await expect(getHeading(page)).toHaveText("Impressum");
		await expect(page.locator("html")).toHaveAttribute("lang", "de-AT");
		await expect(
			page.getByRole("navigation", { name: "Sprache" }).getByRole("link", { name: "Deutsch" }),
		).toHaveAttribute("aria-current", "true");
	});

	test("remembers the language", async ({ page }) => {
		await page.goto("/en");
		await page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "Deutsch" }).click();
		await expect(page.locator("html")).toHaveAttribute("lang", "de-AT");

		await page.goto("/");

		expect(new URL(page.url()).pathname).toBe("/de");
	});

	test("works on not-found pages", async ({ page }) => {
		await page.goto("/en/does-not-exist");
		await page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "Deutsch" }).click();
		await page.waitForURL((url) => {
			return url.pathname === "/de/does-not-exist";
		});

		await expect(getHeading(page)).toHaveText("Seite nicht gefunden");
	});
});

test.describe("color scheme switcher", () => {
	test.use({ colorScheme: "light" });

	test("follows the system by default", async ({ page }) => {
		await page.goto("/en");

		const switcher = page.getByRole("radiogroup", { name: "Color scheme" });
		await expect(switcher.getByRole("radio", { name: "System" })).toBeChecked();

		const light = await getBackground(page);
		await page.emulateMedia({ colorScheme: "dark" });

		await expect.poll(() => getBackground(page)).not.toBe(light);
	});

	test("overrides the system and persists", async ({ page }) => {
		await page.goto("/en");
		const light = await getBackground(page);

		await selectColorScheme(page, "Dark");

		await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark");
		await expect.poll(() => getBackground(page)).not.toBe(light);

		await page.reload();

		await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark");
		await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();
	});

	test.describe("without client-side javascript", () => {
		test.use({ allowedErrors: /Failed to load resource|Loading (?:failed|module)|script/i });

		test("applies before hydration", async ({ page }) => {
			await page.addInitScript(() => {
				localStorage.setItem("color-scheme", "dark");
			});

			await page.route("**/_next/static/**/*.js", (route) => {
				return route.abort();
			});

			await page.goto("/en");

			await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark");
		});
	});

	test("persists across client navigations and locale changes", async ({ page }) => {
		await page.goto("/en");
		await selectColorScheme(page, "Dark");

		await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Imprint" }).click();
		await expect(getHeading(page)).toHaveText("Imprint");
		await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark");

		await page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "Deutsch" }).click();
		await expect(getHeading(page)).toHaveText("Impressum");
		await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark");
		await expect(page.getByRole("radio", { name: "Dunkel" })).toBeChecked();
	});

	test("can return to the system setting", async ({ page }) => {
		await page.goto("/en");
		await selectColorScheme(page, "Dark");
		await selectColorScheme(page, "System");

		await expect(page.locator("html")).not.toHaveAttribute("data-color-scheme");

		await page.reload();

		await expect(page.getByRole("radio", { name: "System" })).toBeChecked();
	});

	test("can be changed with the keyboard", async ({ page }) => {
		await page.goto("/en");
		await expect(page.getByRole("radio", { name: "System" })).toBeEnabled();
		await page.getByRole("radio", { name: "System" }).focus();

		await page.keyboard.press("ArrowRight");
		await page.keyboard.press("ArrowRight");

		await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();
		await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark");
	});
});

test.describe("footer", () => {
	test("links to the imprint and to social media", async ({ page }) => {
		await page.goto("/en");

		const footer = page.getByRole("contentinfo");
		await expect(footer.getByRole("link", { name: "Imprint" })).toHaveAttribute("href", "/en/imprint");

		const social = footer.getByRole("navigation", { name: "Social media" }).getByRole("link");
		await expect(social).toHaveCount(en.social.length);

		for (const [index, link] of en.social.entries()) {
			await expect(social.nth(index)).toHaveAttribute("href", link.href);
		}
	});
});
