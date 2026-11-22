import type * as v from "valibot";

import type { FieldErrors } from "#/lib/server-actions/action-state.ts";

interface ValidationErrors {
	fieldErrors: FieldErrors;
	/** Messages of issues without a field, like a check of several fields. */
	rootErrors: Array<string>;
}

/**
 * Groups issues by the first segment of their path, which is the name of the form field, so that an issue of a nested
 * value, like one item of a repeated field, shows on its field.
 */
export function getValidationErrors(issues: ReadonlyArray<v.BaseIssue<unknown>>): ValidationErrors {
	const fieldErrors = new Map<string, Set<string>>();
	const rootErrors = new Set<string>();

	for (const issue of issues) {
		const key: unknown = issue.path?.[0]?.key;

		if (typeof key !== "string") {
			rootErrors.add(issue.message);
			continue;
		}

		let messages = fieldErrors.get(key);

		if (messages == null) {
			messages = new Set();
			fieldErrors.set(key, messages);
		}

		messages.add(issue.message);
	}

	return {
		/** Defines own properties, so that a field named `__proto__` cannot replace the prototype. */
		fieldErrors: Object.fromEntries(Array.from(fieldErrors, ([key, messages]) => [key, Array.from(messages)])),
		rootErrors: Array.from(rootErrors),
	};
}
