import { expect, type Page, test } from "@playwright/test";

import de from "#/content/de/metadata.json";
import en from "#/content/en/metadata.json";

const english = { lang: "en-GB", heading: "Page not found", site: en.title };
const german = { lang: "de-AT", heading: "Seite nicht gefunden", site: de.title };

const notFoundPages = [
	{ from: "/en/does-not-exist", to: "/en/does-not-exist", ...english },
	{ from: "/en/does/not/exist", to: "/en/does/not/exist", ...english },
	{ from: "/de/does-not-exist", to: "/de/does-not-exist", ...german },
	{ from: "/does-not-exist", to: "/en/does-not-exist", ...english },
	{ from: "/en-GB", to: "/en/en-GB", ...english },
	{ from: "/de-AT/does-not-exist", to: "/en/de-AT/does-not-exist", ...english },
	{ from: "/x.png", to: "/x.png", ...english },
	{ from: "/x.png/does-not-exist", to: "/en/x.png/does-not-exist", ...english },
	{ from: "/api/does-not-exist", to: "/api/does-not-exist", ...english },
];

function getHeading(page: Page) {
	return page.getByRole("heading", { level: 1 });
}

test.describe("not found pages", () => {
	for (const { from, to, lang, heading, site } of notFoundPages) {
		test(`${from} renders the ${lang} page`, async ({ page }) => {
			const response = await page.goto(from);
			expect(response?.status()).toBe(404);
			expect(new URL(page.url()).pathname).toBe(to);

			await expect(getHeading(page)).toHaveText(heading);
			await expect(page).toHaveTitle(`${heading} | ${site}`);
			await expect(page.locator("html")).toHaveAttribute("lang", lang);
			await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", "noindex");
		});
	}

	test.describe("for german visitors", () => {
		test.use({ locale: "de-AT" });

		test("unprefixed pathnames use the preferred language", async ({ page }) => {
			const response = await page.goto("/does-not-exist");
			expect(response?.status()).toBe(404);
			expect(new URL(page.url()).pathname).toBe("/de/does-not-exist");

			await expect(getHeading(page)).toHaveText(german.heading);
		});

		test("invalid locales use the default language", async ({ page }) => {
			const response = await page.goto("/x.png");
			expect(response?.status()).toBe(404);

			await expect(getHeading(page)).toHaveText(english.heading);
		});
	});

	test("static files are not rewritten", async ({ request }) => {
		for (const pathname of ["/favicon.ico", "/icon.svg", "/android-chrome-192x192.png"]) {
			const response = await request.get(pathname, { maxRedirects: 0 });
			expect(response.status(), pathname).toBe(200);
		}
	});

	test.describe("without javascript", () => {
		test.use({ javaScriptEnabled: false });

		test("are server-rendered", async ({ page }) => {
			test.fail(true, "Not-found pages are an empty `__next_error__` shell until hydration, see `TODO.md`.");

			await page.goto("/en/does-not-exist");

			await expect(getHeading(page)).toHaveText(english.heading, { timeout: 1000 });
		});
	});
});

const errorPages = [
	{ prefix: "/en", lang: "en-GB", heading: "Something went wrong", retry: "Try again" },
	{ prefix: "/de", lang: "de-AT", heading: "Etwas ist schiefgelaufen", retry: "Erneut versuchen" },
];

test.describe("error pages", () => {
	for (const { prefix, lang, heading, retry } of errorPages) {
		test(`client errors render the ${lang} page`, async ({ page }) => {
			await page.goto(`${prefix}/e2e/client-error`);
			await page.getByRole("button", { name: "Throw error" }).click();

			await expect(getHeading(page)).toHaveText(heading);
			await expect(page).toHaveTitle(heading);
			await expect(page.locator("html")).toHaveAttribute("lang", lang);
		});

		test(`retrying a client error in ${lang} recovers the page`, async ({ page }) => {
			await page.goto(`${prefix}/e2e/client-error`);
			await page.getByRole("button", { name: "Throw error" }).click();
			await page.getByRole("button", { name: retry }).click();

			await expect(getHeading(page)).toHaveText("Client error");
		});

		test(`server errors render the ${lang} page`, async ({ page }) => {
			await page.goto(`${prefix}/e2e/server-error`);

			await expect(getHeading(page)).toHaveText(heading);
			await expect(page.getByText("Secret server error")).toHaveCount(0);
		});
	}

	test("errors in the root layout render the global error page", async ({ page }) => {
		await page.goto("/api/e2e/global-error");
		await page.getByRole("button", { name: "Throw error" }).click();

		await expect(getHeading(page)).toHaveText("Something went wrong");
		await expect(page).toHaveTitle("Something went wrong");
		await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
	});

	test("retrying an error in the root layout recovers the page", async ({ page }) => {
		await page.goto("/api/e2e/global-error");
		await page.getByRole("button", { name: "Throw error" }).click();
		await page.getByRole("button", { name: "Try again" }).click();

		await expect(getHeading(page)).toHaveText("Global error");
	});
});
