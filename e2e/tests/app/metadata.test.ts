import { createUrl, removeTrailingSlash } from "@acdh-oeaw/lib";
import { jsonLdScriptProps } from "react-schemaorg";

import { env } from "@/config/env.config";
import { expect, test } from "@/e2e/lib/test";
import { defaultLocale } from "@/lib/i18n/locales";

test("should set a canonical url", async ({ createIndexPage }) => {
	const { indexPage } = await createIndexPage();
	await indexPage.goto();

	const canonicalUrl = indexPage.page.locator('link[rel="canonical"]');
	await expect(canonicalUrl).toHaveAttribute(
		"href",
		removeTrailingSlash(
			String(createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname: "/" })),
		),
	);
});

/** FIXME: @see https://github.com/vercel/next.js/issues/45620 */
test.fixme("should set document title on not-found page", async ({ createI18n, page }) => {
	const i18n = await createI18n();
	await page.goto("/unknown");
	await expect(page).toHaveTitle(
		[i18n.t("NotFoundPage.meta.title"), i18n.messages.metadata.title].join(" | "),
	);
});

/** FIXME: @see https://github.com/vercel/next.js/issues/45620 */
test.fixme("should disallow indexing of not-found page", async ({ page }) => {
	for (const pathname of ["/unknown"]) {
		await page.goto(pathname);

		const ogTitle = page.locator('meta[name="robots"]');
		await expect(ogTitle).toHaveAttribute("content", "noindex");
	}
});

test("should set page metadata", async ({ createIndexPage }) => {
	const { indexPage, i18n } = await createIndexPage();
	await indexPage.goto();
	const { page } = indexPage;

	const metadata = i18n.messages.metadata;

	const title = metadata.title;
	const description = metadata.description;
	const twitter = metadata.social.twitter;

	expect(title).toBeTruthy();
	expect(description).toBeTruthy();

	const ogType = page.locator('meta[property="og:type"]');
	await expect(ogType).toHaveAttribute("content", "website");

	const twCard = page.locator('meta[name="twitter:card"]');
	await expect(twCard).toHaveAttribute("content", "summary_large_image");

	const twCreator = page.locator('meta[name="twitter:creator"]');
	await expect(twCreator).toHaveAttribute("content", twitter);

	const twSite = page.locator('meta[name="twitter:site"]');
	await expect(twSite).toHaveAttribute("content", twitter);

	// const googleSiteVerification = page.locator('meta[name="google-site-verification"]');
	// await expect(googleSiteVerification).toHaveAttribute("content", "");

	await expect(page).toHaveTitle(title);

	const metaDescription = page.locator('meta[name="description"]');
	await expect(metaDescription).toHaveAttribute("content", description);

	const ogTitle = page.locator('meta[property="og:title"]');
	await expect(ogTitle).toHaveAttribute("content", title);

	const ogDescription = page.locator('meta[property="og:description"]');
	await expect(ogDescription).toHaveAttribute("content", description);

	const ogUrl = page.locator('meta[property="og:url"]');
	await expect(ogUrl).toHaveAttribute(
		"content",
		removeTrailingSlash(
			String(createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname: "/" })),
		),
	);

	const ogLocale = page.locator('meta[property="og:locale"]');
	await expect(ogLocale).toHaveAttribute("content", defaultLocale);
});

test("should add json+ld metadata", async ({ createIndexPage }) => {
	const { indexPage, i18n } = await createIndexPage();
	await indexPage.goto();

	const metadata = i18n.messages.metadata;

	const json = await indexPage.page.locator('script[type="application/ld+json"]').textContent();

	// eslint-disable-next-line playwright/prefer-web-first-assertions
	expect(json).toBe(
		jsonLdScriptProps({
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: metadata.title,
			description: metadata.description,
		}).dangerouslySetInnerHTML?.__html,
	);
});

test("should serve an open-graph image", async ({ createIndexPage, request }) => {
	const { indexPage } = await createIndexPage();
	await indexPage.goto();

	const url = await indexPage.page.locator('meta[property="og:image"]').getAttribute("content");
	expect(url).toContain("/opengraph-image");

	const response = await request.get(String(url));
	const status = response.status();
	const contentType = response.headers()["content-type"];

	expect(status).toBe(200);
	expect(contentType).toBe("image/png");
});
