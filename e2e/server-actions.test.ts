import { expect, type Page, test } from "@playwright/test";

const pathname = "/en/e2e/server-action";

function getNameField(page: Page) {
	return page.getByRole("main").getByRole("textbox", { name: "Name", exact: true });
}

function getNicknameField(page: Page) {
	return page.getByRole("main").getByRole("textbox", { name: "Nickname", exact: true });
}

/** Password inputs have no aria role. */
function getPasswordField(page: Page) {
	return page.getByRole("main").getByLabel("Password", { exact: true });
}

/** Typing before hydration is lost, see the fixture. */
async function gotoHydrated(page: Page, path: string): Promise<void> {
	await page.goto(path);
	await expect(page.getByRole("main").getByText("Hydrated")).toBeVisible();
}

async function submit(page: Page, button: string): Promise<void> {
	await page.getByRole("main").getByRole("button", { name: button, exact: true }).click();
}

test.describe("server actions", () => {
	test("show field errors for invalid input", async ({ page }) => {
		await gotoHydrated(page, pathname);
		await submit(page, "Succeed");

		const name = getNameField(page);
		await expect(name).toHaveAttribute("aria-invalid", "true");
		await expect(name).toHaveAccessibleDescription("Enter a name.");
		await expect(page.getByRole("main").getByRole("alert")).toHaveText("Please correct the highlighted fields.");
	});

	test("translate the messages of checks without a message", async ({ page }) => {
		await gotoHydrated(page, "/de/e2e/server-action");
		await getNameField(page).fill("Ada");
		await getNicknameField(page).fill("A nickname that is too long");
		await submit(page, "Succeed");

		await expect(getNicknameField(page)).toHaveAccessibleDescription("Geben Sie einen gültigen Wert ein.");
	});

	test("check authorization before validation", async ({ baseURL, context, page }) => {
		await context.addCookies([{ name: "e2e-authorization", value: "denied", url: baseURL }]);
		await gotoHydrated(page, pathname);
		await getNameField(page).fill("Ada");
		await submit(page, "Time out during validation");

		await expect(page.getByRole("main").getByRole("alert")).toHaveText("You are not allowed to do this.");
	});

	test("return data on success", async ({ page }) => {
		await gotoHydrated(page, pathname);
		await getNameField(page).fill("Ada");
		await submit(page, "Succeed");

		await expect(page.getByRole("main").getByRole("status")).toHaveText("Saved Ada");
	});

	test("show the message and field errors of an ActionError, and keep the values", async ({ page }) => {
		await gotoHydrated(page, pathname);
		await getNameField(page).fill("Ada");
		await submit(page, "Fail expectedly");

		await expect(page.getByRole("main").getByRole("alert")).toHaveText("This name is taken.");
		await expect(getNameField(page)).toHaveAccessibleDescription("Choose another name.");
		await expect(getNameField(page)).toHaveValue("Ada");
	});

	test("don't send back the values of omitted fields", async ({ page }) => {
		await gotoHydrated(page, pathname);
		await getNameField(page).fill("Ada");
		await getPasswordField(page).fill("secret");
		await submit(page, "Fail expectedly");

		await expect(page.getByRole("main").getByRole("alert")).toHaveText("This name is taken.");
		await expect(getNameField(page)).toHaveValue("Ada");
		await expect(getPasswordField(page)).toHaveValue("");
	});

	test("show a generic message for unexpected errors", async ({ page }) => {
		await gotoHydrated(page, pathname);
		await getNameField(page).fill("Ada");
		await submit(page, "Fail unexpectedly");

		await expect(page.getByRole("main").getByRole("alert")).toHaveText(
			"An unexpected error occurred. Please try again.",
		);
		await expect(page.getByText("Internal error message")).toHaveCount(0);
	});

	test("show that a service is not available after a timeout", async ({ page }) => {
		await gotoHydrated(page, pathname);
		await getNameField(page).fill("Ada");
		await submit(page, "Time out");

		await expect(page.getByRole("main").getByRole("alert")).toHaveText(
			"The service is not available. Please try again later.",
		);
	});

	test("show that a service is not available after a timeout during validation, and keep the values", async ({
		page,
	}) => {
		await gotoHydrated(page, pathname);
		await getNameField(page).fill("Ada");
		await submit(page, "Time out during validation");

		await expect(page.getByRole("main").getByRole("alert")).toHaveText(
			"The service is not available. Please try again later.",
		);
		await expect(getNameField(page)).toHaveValue("Ada");
	});

	test("can redirect", async ({ page }) => {
		await gotoHydrated(page, pathname);
		await getNameField(page).fill("Ada");
		await submit(page, "Redirect");

		await expect(page).toHaveURL(/\/en$/);
	});

	test("translate messages with the locale of the page", async ({ page }) => {
		await gotoHydrated(page, "/de/e2e/server-action");
		await getNameField(page).fill("Ada");
		await submit(page, "Fail unexpectedly");

		await expect(page.getByRole("main").getByRole("alert")).toHaveText(
			"Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
		);
	});

	test.describe("without javascript", () => {
		test.use({ javaScriptEnabled: false });

		test("show field errors and keep the values", async ({ page }) => {
			await page.goto(pathname);
			await getNameField(page).fill("Ada");
			await submit(page, "Fail expectedly");

			await expect(page.getByRole("main").getByRole("alert")).toHaveText("This name is taken.");
			await expect(getNameField(page)).toHaveValue("Ada");
		});
	});
});
