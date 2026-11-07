import { expect, test as base } from "@playwright/test";

/**
 * What the browser logs when a test route throws on purpose. Errors from the server are logged without their message,
 * as a minified React error, or as a plain `Error` in Firefox.
 */
export const thrownErrors = /Test error|Minified React error #441|^console error: Error$/;

/** WebKit reports prefetches which are cancelled by leaving the page as uncaught exceptions. */
const ignoredErrors = /\?_rsc=\S+ due to access control checks/;

interface Options {
	/** Console errors and uncaught exceptions which are expected in a test, e.g. when it throws on purpose. */
	allowedErrors: RegExp | null;
}

/** Fails every test which uses `page` on uncaught exceptions, console errors and failed same-origin requests. */
export const test = base.extend<Options>({
	allowedErrors: [null, { option: true }],

	page: async ({ allowedErrors, baseURL, page }, run) => {
		const problems: Array<string> = [];
		/** Tests check the status of the document themselves, so a 404 page is not a problem. */
		const documents = new Set<string>();

		function report(problem: string): void {
			if (allowedErrors?.test(problem) !== true && !ignoredErrors.test(problem)) {
				problems.push(problem);
			}
		}

		page.on("pageerror", (error) => {
			report(`uncaught exception: ${error.message}`);
		});

		page.on("response", (response) => {
			if (response.request().isNavigationRequest()) {
				documents.add(response.url());
			} else if (response.status() >= 400 && response.url().startsWith(baseURL ?? "")) {
				report(`request failed with status ${String(response.status())}: ${response.url()}`);
			}
		});

		page.on("console", (message) => {
			if (message.type() === "error" && !documents.has(message.location().url)) {
				report(`console error: ${message.text()}`);
			}
		});

		await run(page);

		expect(problems).toEqual([]);
	},
});
