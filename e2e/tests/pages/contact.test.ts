import { assert, createUrl } from "@acdh-oeaw/lib";

import { env } from "@/config/env.config";
import { expect, test } from "@/e2e/lib/test";
import { locales } from "@/lib/i18n/locales";

test.describe("contact page", () => {
	test("should have document title", async ({ createContactPage }) => {
		for (const locale of locales) {
			const { i18n, contactPage } = await createContactPage(locale);
			await contactPage.goto();

			await expect(contactPage.page).toHaveTitle(
				[i18n.t("ContactPage.meta.title"), i18n.messages.metadata.title].join(" | "),
			);
		}
	});

	test("should not have any automatically detectable accessibility issues", async ({
		createAccessibilityScanner,
		createContactPage,
	}) => {
		for (const locale of locales) {
			const { contactPage } = await createContactPage(locale);
			await contactPage.goto();

			const { getViolations } = await createAccessibilityScanner();
			expect(await getViolations()).toEqual([]);
		}
	});

	// eslint-disable-next-line playwright/no-skipped-test
	test.describe.skip("should not have visible changes", () => {
		test.use({ colorScheme: "light" });

		test("in light mode", async ({ createContactPage }) => {
			for (const locale of locales) {
				const { contactPage } = await createContactPage(locale);
				await contactPage.goto();

				await expect(contactPage.page).toHaveScreenshot({ fullPage: true });
			}
		});
	});

	// eslint-disable-next-line playwright/no-skipped-test
	test.describe.skip("should not have visible changes", () => {
		test.use({ colorScheme: "dark" });

		test("in dark mode", async ({ createContactPage }) => {
			for (const locale of locales) {
				const { contactPage } = await createContactPage(locale);
				await contactPage.goto();

				await expect(contactPage.page).toHaveScreenshot({ fullPage: true });
			}
		});
	});

	test("should display client-side validation errors for missing required fields", async ({
		createContactPage,
	}) => {
		for (const locale of locales) {
			// FIXME: client-side validation error messages use the current browser locale setting,
			// not the application's locale setting.
			const message = "Please fill out this field.";

			const { contactPage } = await createContactPage(locale);
			await contactPage.goto();

			await contactPage.form.submit.click();

			await expect(contactPage.form.email).toHaveAccessibleDescription(message);
			await expect(contactPage.form.subject).toHaveAccessibleDescription(message);
			await expect(contactPage.form.message).toHaveAccessibleDescription(message);
		}
	});

	test("should display client-side validation error for invalid email address", async ({
		createContactPage,
	}) => {
		for (const locale of locales) {
			// FIXME: client-side validation error messages use the current browser locale setting,
			// not the application's locale setting.
			const message = "Please enter an email address.";

			const { contactPage } = await createContactPage(locale);
			await contactPage.goto();

			await contactPage.form.email.fill("test example.org");
			await contactPage.form.submit.click();

			await expect(contactPage.form.email).toHaveAccessibleDescription(message);
		}
	});

	test.describe("email", () => {
		/** Run sequentially. */
		test.describe.configure({ mode: "default" });

		const baseUrl = env.EMAIL_SERVICE_API_BASE_URL;
		assert(baseUrl != null, "Missing email service api base url.");

		test("should send email with contact form content and display success message", async ({
			createContactPage,
			request,
		}) => {
			for (const locale of locales) {
				const { contactPage, i18n } = await createContactPage(locale);
				await contactPage.goto();

				const to = env.EMAIL_ADDRESS;
				const from = "test@example.org";
				const subject = "This is a test";
				const message = `The current time is ${new Date().toISOString()}.`;

				await contactPage.form.email.fill(from);
				await contactPage.form.subject.fill(subject);
				await contactPage.form.message.fill(message);
				await contactPage.form.submit.click();

				// TODO: consider `page.waitForFunction` with `polling` option
				/** Wait for email service. */
				// eslint-disable-next-line playwright/no-wait-for-timeout
				await contactPage.page.waitForTimeout(100);

				/** @see https://mailpit.axllent.org/docs/api-v1/view.html#get-/api/v1/message/-ID- */
				const response = await request.get(
					String(createUrl({ baseUrl, pathname: "/api/v1/message/latest" })),
				);
				const data = (await response.json()) as {
					Date: string;
					From: { Address: string };
					Subject: string;
					Text: string;
					To: Array<{ Address: string }>;
				};

				expect(data.From.Address).toBe(from);
				expect(data.To[0]?.Address).toBe(to);
				expect(data.Subject).toBe(subject);
				expect(data.Text.trim()).toBe(message);

				await expect(
					contactPage.page.getByText(i18n.t("actions.sendContactFormEmailAction.success")),
				).toBeVisible();
			}
		});

		test("should display error message when sending email fails", async ({
			createContactPage,
			request,
		}) => {
			for (const locale of locales) {
				const { contactPage, i18n } = await createContactPage(locale);
				await contactPage.goto();

				/** @see https://mailpit.axllent.org/docs/api-v1/view.html#put-/api/v1/chaos */
				await request.put(String(createUrl({ baseUrl, pathname: "/api/v1/chaos" })), {
					data: {
						// Authentication: { ErrorCode: 451, Probability: 100 },
						Recipient: { ErrorCode: 451, Probability: 100 },
						// Sender: { ErrorCode: 451, Probability: 100 },
					},
				});

				/** Wait for email service. */
				// eslint-disable-next-line playwright/no-wait-for-timeout
				await contactPage.page.waitForTimeout(100);

				const from = "test@example.org";
				const subject = "This is a test";
				const message = `The current time is ${new Date().toISOString()}.`;

				await contactPage.form.email.fill(from);
				await contactPage.form.subject.fill(subject);
				await contactPage.form.message.fill(message);
				await contactPage.form.submit.click();

				/** Wait for email service. */
				// eslint-disable-next-line playwright/no-wait-for-timeout
				await contactPage.page.waitForTimeout(100);

				await request.put(String(createUrl({ baseUrl, pathname: "/api/v1/chaos" })), {
					data: {},
				});

				await expect(
					contactPage.page.getByText(i18n.t("actions.sendContactFormEmailAction.error")),
				).toBeVisible();

				/** Don't reset form fields on error. */
				await expect(contactPage.form.email).toHaveValue(from);
				await expect(contactPage.form.subject).toHaveValue(subject);
				await expect(contactPage.form.message).toHaveValue(message);
			}
		});
	});
});
