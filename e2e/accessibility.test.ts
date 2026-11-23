import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { sitemapPages } from "#/e2e/pages.ts";

const pathnames = [...sitemapPages, "/en/e2e/search-params?q=vienna&page=2", "/en/does-not-exist", "/en/search"];

const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

for (const colorScheme of ["light", "dark"] as const) {
	test.describe(`accessibility (${colorScheme})`, () => {
		test.use({ colorScheme });

		for (const pathname of pathnames) {
			test(`${pathname} has no detectable violations`, async ({ page }) => {
				await page.goto(pathname);

				const results = await new AxeBuilder({ page }).withTags(tags).analyze();

				expect(results.violations).toStrictEqual([]);
			});
		}
	});
}
