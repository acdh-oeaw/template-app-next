/* eslint-disable react-hooks/rules-of-hooks */

import { createUrl } from "@acdh-oeaw/lib";
import { test as base } from "@playwright/test";

import { env } from "@/config/env.config";
import { type AccessibilityScanner, createAccessibilityScanner } from "@/e2e/lib/fixtures/a11y";
import { createI18n, type I18n, type WithI18n } from "@/e2e/lib/fixtures/i18n";
import { ImprintPage } from "@/e2e/lib/fixtures/imprint-page";
import { IndexPage } from "@/e2e/lib/fixtures/index-page";
import { defaultLocale, type IntlLocale } from "@/lib/i18n/locales";

interface Fixtures {
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	beforeEachTest: void;

	createAccessibilityScanner: () => Promise<AccessibilityScanner>;
	createI18n: (locale: IntlLocale) => Promise<I18n>;
	createImprintPage: (locale: IntlLocale) => Promise<WithI18n<{ imprintPage: ImprintPage }>>;
	createIndexPage: (locale: IntlLocale) => Promise<WithI18n<{ indexPage: IndexPage }>>;
}

export const test = base.extend<Fixtures>({
	/** @see https://playwright.dev/docs/test-fixtures#adding-global-beforeeachaftereach-hooks */
	beforeEachTest: [
		async ({ context }, use) => {
			if (env.NEXT_PUBLIC_MATOMO_BASE_URL != null) {
				/**
				 * If we were to block loading the actual matomo javascript snippet, we would need to
				 * check if `windows._paq` was pushed to (because no requests to `matomo.php`
				 * would be dispatched).
				 */
				// const scriptUrl = String(
				// 	createUrl({ baseUrl: env.NEXT_PUBLIC_MATOMO_BASE_URL, pathname: "/matomo.js" }),
				// );

				// await context.route(scriptUrl, (route) => {
				// 	return route.fulfill({ status: 200, body: "" });
				// });

				const baseUrl = String(
					createUrl({ baseUrl: env.NEXT_PUBLIC_MATOMO_BASE_URL, pathname: "/matomo.php?**" }),
				);

				await context.route(baseUrl, (route) => {
					return route.fulfill({ status: 204, body: "" });
				});
			}

			await use();
		},
		{ auto: true },
	],

	async createAccessibilityScanner({ page }, use) {
		await use(() => {
			return createAccessibilityScanner(page);
		});
	},

	async createI18n({ page }, use) {
		await use((locale) => {
			return createI18n(page, locale);
		});
	},

	async createImprintPage({ page }, use) {
		async function createImprintPage(locale = defaultLocale) {
			const i18n = await createI18n(page, locale);
			const imprintPage = new ImprintPage(page, locale, i18n);
			return { i18n, imprintPage };
		}

		await use(createImprintPage);
	},

	async createIndexPage({ page }, use) {
		async function createIndexPage(locale = defaultLocale) {
			const i18n = await createI18n(page, locale);
			const indexPage = new IndexPage(page, locale, i18n);
			return { i18n, indexPage };
		}

		await use(createIndexPage);
	},
});

export { expect } from "@playwright/test";
