import { expect, type Page, test } from "@playwright/test";

const pathname = "/en/contact";

/**
 * Typing before hydration is lost. The locale switcher adds search params in the browser, inside a suspense boundary,
 * which hydrates after the form.
 */
async function gotoHydrated(page: Page): Promise<void> {
	await page.goto(`${pathname}?hydrated`);
	await expect(
		page.getByRole("banner").getByRole("navigation", { name: "Language" }).getByRole("link").first(),
	).toHaveAttribute("href", /\?hydrated=?$/);
}

async function fillForm(page: Page, values: { name: string; email: string; message: string }): Promise<void> {
	const main = page.getByRole("main");
	await main.getByRole("textbox", { name: "Name" }).fill(values.name);
	await main.getByRole("textbox", { name: "Email address" }).fill(values.email);
	await main.getByRole("textbox", { name: "Message" }).fill(values.message);
}

test.describe("contact form", () => {
	test.beforeEach(async ({ context }) => {
		/** An address of its own, because the action is rate limited, and tests run in parallel from the same address. */
		const prefix = crypto.randomUUID().slice(0, 4);
		await context.setExtraHTTPHeaders({ "x-forwarded-for": `2001:db8:${prefix}::1` });
	});

	test("shows field errors from the server", async ({ page }) => {
		await gotoHydrated(page);
		/** Only spaces pass the browser's `required` check, but not the server's validation, which trims them. */
		await fillForm(page, { name: "   ", email: "ada@example.com", message: "Hello!" });
		await page.getByRole("main").getByRole("button", { name: "Send" }).click();

		const name = page.getByRole("main").getByRole("textbox", { name: "Name" });
		await expect(name).toHaveAttribute("aria-invalid", "true");
		await expect(name).toHaveAccessibleDescription("Enter your name.");
		await expect(page.getByRole("main").getByRole("textbox", { name: "Message" })).toHaveValue("Hello!");
	});

	/** Without sending mail, so this needs no smtp server. */
	test("responds to bots that fill in the honeypot as if the message was sent", async ({ page }) => {
		await gotoHydrated(page);
		await fillForm(page, { name: "Bot", email: "bot@example.com", message: "Spam" });
		/** People cannot fill in the hidden field, which Playwright refuses too, so set its value directly. */
		await page
			.getByRole("main")
			.getByRole("textbox", { name: "Website", includeHidden: true })
			.evaluate((input: HTMLInputElement) => {
				input.value = "https://example.com";
			});
		await page.getByRole("main").getByRole("button", { name: "Send" }).click();

		await expect(page.getByRole("main").getByRole("status")).toHaveText("Thank you, your message has been sent.");
	});
});
