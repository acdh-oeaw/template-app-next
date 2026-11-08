import { expect, type Locator, type Page, test } from "@playwright/test";

function getSwitcher(page: Page): Locator {
	return page.getByRole("banner").getByRole("navigation");
}

function getLink(page: Page, name: string): Locator {
	return getSwitcher(page).getByRole("link", { name, exact: true });
}

/**
 * Before hydration, links do a full page load instead of a client navigation. The switcher adds search params in the
 * browser, so they show that it is hydrated.
 */
async function gotoHydrated(page: Page, pathname: string): Promise<void> {
	await page.goto(`${pathname}?hydrated`);
	await expect(getSwitcher(page).getByRole("link").first()).toHaveAttribute("href", /\?hydrated=?$/);
}

test.describe("locale switcher", () => {
	test("links to the current page in every locale", async ({ page }) => {
		await page.goto("/en/imprint");

		await expect(getLink(page, "English")).toHaveAttribute("href", "/en/imprint");
		await expect(getLink(page, "Deutsch (German)")).toHaveAttribute("href", "/de/imprint");
	});

	test("marks the current locale", async ({ page }) => {
		await page.goto("/de");

		await expect(getLink(page, "Deutsch")).toHaveAttribute("aria-current", "page");
		await expect(getLink(page, "English (Englisch)")).not.toHaveAttribute("aria-current");
	});

	test("names each locale in its own language, and in the current language", async ({ page }) => {
		await page.goto("/de");

		await expect(getSwitcher(page).getByRole("link")).toHaveText(["English (Englisch)", "Deutsch"]);
		await expect(getLink(page, "English (Englisch)").getByText("English", { exact: true })).toHaveAttribute(
			"lang",
			"en",
		);
		await expect(getLink(page, "Deutsch").getByText("Deutsch", { exact: true })).toHaveAttribute("lang", "de");
	});

	test("switches the locale", async ({ page }) => {
		await page.goto("/en/imprint");

		await getLink(page, "Deutsch (German)").click();

		await expect(page).toHaveURL(/\/de\/imprint$/);
		await expect(page.locator("html")).toHaveAttribute("lang", "de-AT");
		await expect(page.getByRole("heading", { level: 1, name: "Impressum" })).toBeVisible();
	});

	test("keeps focus on the switcher", async ({ page }) => {
		await gotoHydrated(page, "/en/imprint");

		await getLink(page, "Deutsch (German)").focus();
		await page.keyboard.press("Enter");

		await expect(page.getByRole("heading", { level: 1, name: "Impressum" })).toBeVisible();
		await expect(getLink(page, "Deutsch")).toBeFocused();

		await page.keyboard.press("Shift+Tab");
		await expect(getLink(page, "English (Englisch)")).toBeFocused();
	});

	test("announces the new page", async ({ page }) => {
		await gotoHydrated(page, "/en/imprint");

		await getLink(page, "Deutsch (German)").focus();
		await page.keyboard.press("Enter");

		await expect(page.locator("html")).toHaveAttribute("lang", "de-AT");
		/** The route announcer of Next.js, in a shadow root. */
		await expect(page.getByRole("alert")).toHaveText("Impressum");
	});

	test("does not move focus on later navigations", async ({ page }) => {
		await gotoHydrated(page, "/en");

		await getLink(page, "Deutsch (German)").click();
		await expect(page).toHaveURL(/\/de\?hydrated=?$/);

		await page.getByRole("contentinfo").getByRole("link", { name: "Impressum" }).focus();
		await page.keyboard.press("Enter");

		await expect(page.getByRole("heading", { level: 1, name: "Impressum" })).toBeVisible();
		await expect(page.getByRole("contentinfo").getByRole("link", { name: "Impressum" })).toBeFocused();
	});

	test("remembers the selected locale", async ({ page }) => {
		await page.goto("/en");

		await getLink(page, "Deutsch (German)").click();
		await expect(page).toHaveURL(/\/de$/);

		await page.goto("/");
		await expect(page).toHaveURL(/\/de$/);
	});

	test("keeps search params from the initial url", async ({ page }) => {
		await page.goto("/en/imprint?tag=a&tag=b&q=x%26y");

		const search = "?tag=a&tag=b&q=x%26y";
		await expect(getLink(page, "Deutsch (German)")).toHaveAttribute("href", `/de/imprint${search}`);

		await getLink(page, "Deutsch (German)").click();

		await expect(page).toHaveURL(new RegExp(`/de/imprint\\${search}$`));
		await expect(page.getByRole("heading", { level: 1, name: "Impressum" })).toBeVisible();
	});

	test("keeps search params on the index page", async ({ page }) => {
		await page.goto("/en?q=1");

		await expect(getLink(page, "Deutsch (German)")).toHaveAttribute("href", "/de?q=1");
	});

	test("follows search params changed by client navigation", async ({ page }) => {
		await page.goto("/en");
		await expect(getLink(page, "Deutsch (German)")).toHaveAttribute("href", "/de");

		await page.evaluate(() => {
			(window as unknown as { next: { router: { push: (href: string) => void } } }).next.router.push("/en?q=1");
		});

		await expect(getLink(page, "Deutsch (German)")).toHaveAttribute("href", "/de?q=1");
	});

	test("keeps the pathname on not-found pages", async ({ page }) => {
		await page.goto("/en/does-not-exist");

		await expect(getLink(page, "Deutsch (German)")).toHaveAttribute("href", "/de/does-not-exist");
	});

	test("logs no errors with search params", async ({ page }) => {
		const errors: Array<string> = [];
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
		page.on("pageerror", (error) => {
			errors.push(error.message);
		});

		await page.goto("/en/imprint?q=1");
		await expect(getLink(page, "Deutsch (German)")).toHaveAttribute("href", "/de/imprint?q=1");

		expect(errors).toEqual([]);
	});

	test.describe("in the static shell", () => {
		test.use({ javaScriptEnabled: false });

		test("switches the locale without client-side javascript", async ({ page }) => {
			await page.goto("/en/imprint");

			await getLink(page, "Deutsch (German)").click();

			await expect(page).toHaveURL(/\/de\/imprint$/);
			await expect(page.getByRole("heading", { level: 1, name: "Impressum" })).toBeVisible();
		});
	});

	test("is part of the prerendered html, without request-time data", async ({ request }) => {
		const response = await request.get("/en/imprint?q=1");

		const html = await response.text();
		expect(html).toContain('href="/de/imprint"');
		expect(html).not.toContain('href="/de/imprint?q=1"');
	});
});
