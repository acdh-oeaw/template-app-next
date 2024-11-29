import { expect, test } from "@/e2e/lib/test";
import { defaultLocale } from "@/lib/i18n/locales";

test.describe("i18n", () => {
	test("should set `lang` attribute on `html` element", async ({ createIndexPage }) => {
		const { indexPage } = await createIndexPage();
		await indexPage.goto();
		await expect(indexPage.page.locator("html")).toHaveAttribute("lang", defaultLocale);
	});
});
