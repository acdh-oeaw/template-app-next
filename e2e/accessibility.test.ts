import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pathnames = ["/en", "/en/about", "/en/imprint", "/en/does-not-exist", "/de", "/de/about", "/de/imprint"];

const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

for (const colorScheme of ["light", "dark"] as const) {
	test.describe(`accessibility (${colorScheme})`, () => {
		test.use({ colorScheme });

		for (const pathname of pathnames) {
			test(`${pathname} has no detectable violations`, async ({ page }) => {
				await page.goto(pathname);
				/** Not-found pages are not server-rendered yet, so wait for the client to render them. */
				await expect(page.getByRole("main")).toBeVisible();

				const results = await new AxeBuilder({ page }).withTags(tags).analyze();

				expect(results.violations).toEqual([]);
			});
		}
	});
}
