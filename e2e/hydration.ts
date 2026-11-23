import { expect, type Locator } from "@playwright/test";

/**
 * Waits until React has hydrated the element, because text typed into a field before is lost. React attaches its props
 * to each DOM node it hydrates, and parts of a page, like each route segment, hydrate separately, so pass an element of
 * the part the test uses, like the submit button of a form.
 */
export async function waitForHydration(locator: Locator): Promise<void> {
	await expect
		.poll(() => locator.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$"))))
		.toBe(true);
}
