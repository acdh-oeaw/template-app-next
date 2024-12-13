import { createUrl } from "@acdh-oeaw/lib";

import { env } from "@/config/env.config";
import { defaultLocale, locales } from "@/config/i18n.config";
import { expect, test } from "@/e2e/lib/test";

test.describe("app", () => {
	if (env.NEXT_PUBLIC_BOTS !== "enabled") {
		test("should serve a robots.txt which disallows search engine bots", async ({ request }) => {
			const response = await request.get("/robots.txt");
			const body = await response.body();

			// TODO: use toMatchSnapshot
			expect(body.toString()).toEqual(
				["User-Agent: *", "Disallow: /", "", `Host: ${env.NEXT_PUBLIC_APP_BASE_URL}`, ""].join(
					"\n",
				),
			);
		});
	} else {
		test("should serve a robots.txt", async ({ request }) => {
			const response = await request.get("/robots.txt");
			const body = await response.body();

			// TODO: use toMatchSnapshot
			expect(body.toString()).toEqual(
				[
					"User-Agent: *",
					"Allow: /",
					"",
					`Host: ${env.NEXT_PUBLIC_APP_BASE_URL}`,
					`Sitemap: ${String(
						createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname: "sitemap.xml" }),
					)}`,
					"",
				].join("\n"),
			);
		});
	}

	test("should serve a sitemap.xml", async ({ request }) => {
		const response = await request.get("/sitemap.xml");
		const body = await response.body();

		// TODO: use toMatchSnapshot
		expect(body.toString()).toContain(
			[
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
			].join("\n"),
		);

		for (const locale of locales) {
			for (const url of ["/", "/imprint"]) {
				const loc = String(
					createUrl({
						baseUrl: env.NEXT_PUBLIC_APP_BASE_URL,
						pathname: ["/", locale, url].join(""),
					}),
				);

				expect(body.toString()).toContain(`<loc>${loc}</loc>`);
			}
		}
	});

	test("should serve a webmanifest", async ({ createI18n, request }) => {
		const response = await request.get("/manifest.webmanifest");
		const body = await response.body();

		const i18n = await createI18n(defaultLocale);

		expect(body.toString()).toEqual(
			JSON.stringify({
				name: i18n.t("metadata.manifest.name"),
				short_name: i18n.t("metadata.manifest.short-name"),
				description: i18n.t("metadata.manifest.description"),
				start_url: "/",
				display: "standalone",
				background_color: "#fff",
				theme_color: "#fff",
				icons: [
					{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
					{ src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
					{ src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
					{ src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
				],
			}),
		);
	});

	test("should serve a favicon.ico", async ({ request }) => {
		const response = await request.get("/favicon.ico");
		const status = response.status();

		expect(status).toEqual(200);
	});

	test("should serve an svg favicon", async ({ request }) => {
		const response = await request.get("/icon.svg");
		const status = response.status();

		expect(status).toEqual(200);
	});

	test("should serve an apple favicon", async ({ request }) => {
		const response = await request.get("/apple-icon.png");
		const status = response.status();

		expect(status).toEqual(200);
	});

	test.describe("should set color mode according to system preference", () => {
		test.use({ colorScheme: "no-preference" });

		test("with no preference", async ({ createIndexPage }) => {
			const { indexPage } = await createIndexPage(defaultLocale);
			await indexPage.goto();
			await expect(indexPage.page.locator("html")).toHaveAttribute("data-ui-color-scheme", "light");
		});
	});

	test.describe("should set color mode according to system preference", () => {
		test.use({ colorScheme: "light" });

		test("in light mode", async ({ createIndexPage }) => {
			const { indexPage } = await createIndexPage(defaultLocale);
			await indexPage.goto();
			await expect(indexPage.page.locator("html")).toHaveAttribute("data-ui-color-scheme", "light");
		});
	});

	test.describe("should set color mode according to system preference", () => {
		test.use({ colorScheme: "dark" });

		test("in dark mode", async ({ createIndexPage }) => {
			const { indexPage } = await createIndexPage(defaultLocale);
			await indexPage.goto();
			await expect(indexPage.page.locator("html")).toHaveAttribute("data-ui-color-scheme", "dark");
		});
	});

	test("should skip to main content with skip-link", async ({ createIndexPage }) => {
		const { indexPage } = await createIndexPage(defaultLocale);
		await indexPage.goto();

		await indexPage.page.keyboard.press("Tab");
		await expect(indexPage.skipLink).toBeFocused();

		await indexPage.skipLink.click();
		await expect(indexPage.mainContent).toBeFocused();
	});

	test.describe("should add aria-current attribute to nav links", () => {
		test.use({ viewport: { width: 1440, height: 1024 } });

		test("on desktop", async ({ createIndexPage, page }) => {
			const { indexPage, i18n } = await createIndexPage(defaultLocale);
			await indexPage.goto();

			const homeLink = indexPage.page
				.getByRole("link", {
					name: i18n.t("AppHeader.links.home"),
				})
				.first();
			const aboutLink = indexPage.page.getByRole("link", {
				name: i18n.t("AppHeader.links.about"),
			});

			await expect(homeLink).toHaveAttribute("aria-current", "page");
			await expect(aboutLink).not.toHaveAttribute("aria-current", "page");

			await aboutLink.click();
			await page.waitForURL("**/about");

			await expect(homeLink).not.toHaveAttribute("aria-current", "page");
			await expect(aboutLink).toHaveAttribute("aria-current", "page");
		});
	});

	test.describe("should add aria-current attribute to nav links", () => {
		test.use({ viewport: { width: 393, height: 852 } });

		test("on mobile", async ({ createIndexPage, page }) => {
			const { indexPage, i18n } = await createIndexPage(defaultLocale);
			await indexPage.goto();

			await indexPage.page.getByRole("navigation").getByRole("button").click();

			const homeLink = indexPage.page
				.getByRole("link", {
					name: i18n.t("AppHeader.links.home"),
				})
				.first();
			const aboutLink = indexPage.page.getByRole("link", {
				name: i18n.t("AppHeader.links.about"),
			});

			await expect(homeLink).toHaveAttribute("aria-current", "page");
			await expect(aboutLink).not.toHaveAttribute("aria-current", "page");

			await aboutLink.click();
			await page.waitForURL("**/about");

			await indexPage.page.getByRole("navigation").getByRole("button").click();

			await expect(homeLink).not.toHaveAttribute("aria-current", "page");
			await expect(aboutLink).toHaveAttribute("aria-current", "page");
		});
	});

	/**
	 * Work around chrome-only bug: @see `./components/main-content.tsx`.
	 */
	test("should not scroll page when changing locale", async ({ createIndexPage, page }) => {
		const { indexPage: enIndexPage, i18n: en } = await createIndexPage("en");
		await enIndexPage.goto();
		await enIndexPage.page
			.getByRole("link", {
				name: en.t("LocaleSwitcher.switch-locale-to", {
					locale: new Intl.DisplayNames(["en"], { type: "language" }).of("de"),
				}),
			})
			.click();

		const { indexPage: deIndexPage, i18n: de } = await createIndexPage("de");
		await deIndexPage.page
			.getByRole("link", {
				name: de.t("LocaleSwitcher.switch-locale-to", {
					locale: new Intl.DisplayNames(["de"], { type: "language" }).of("en"),
				}),
			})
			.click();

		const scrollPosition = await page.evaluate(() => {
			return { x: window.scrollX, y: window.scrollY };
		});

		expect(scrollPosition.x).toBe(0);
		expect(scrollPosition.y).toBe(0);
	});
});
