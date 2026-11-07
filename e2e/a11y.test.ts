import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

const pathnames = ["/en", "/en/imprint", "/en/does-not-exist", "/de", "/de/imprint", "/de/does-not-exist", "/x.png"];

const errorPages = ["/en/e2e/client-error", "/de/e2e/client-error", "/api/e2e/global-error"];

/** Waits for the heading first, because not-found pages only render client-side. */
async function getViolations(page: Page) {
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

	const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();

	return violations.map((violation) => {
		return { id: violation.id, targets: violation.nodes.map((node) => node.target) };
	});
}

for (const colorScheme of ["light", "dark"] as const) {
	test.describe(`accessibility in ${colorScheme} mode`, () => {
		test.use({ colorScheme });

		for (const pathname of pathnames) {
			test(`${pathname} has no violations`, async ({ page }) => {
				await page.goto(pathname);

				expect(await getViolations(page)).toEqual([]);
			});
		}

		for (const pathname of errorPages) {
			test(`error page for ${pathname} has no violations`, async ({ page }) => {
				await page.goto(pathname);
				await page.getByRole("button", { name: "Throw error" }).click();

				await expect(page.getByRole("button", { name: "Throw error" })).toHaveCount(0);

				expect(await getViolations(page)).toEqual([]);
			});
		}
	});
}
