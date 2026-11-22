import type { FormValues } from "#/lib/server-actions/action-state.ts";

export type FormDataValues = Record<string, FormDataEntryValue | Array<FormDataEntryValue>>;

/**
 * A field with several values, like a group of checkboxes, becomes an array, but only when more than one is set, so
 * schemas for such fields should accept a single value too.
 */
export function getFormDataValues(formData: FormData): FormDataValues {
	const entries: Array<[string, FormDataEntryValue | Array<FormDataEntryValue>]> = [];

	for (const key of new Set(formData.keys())) {
		const values = formData.getAll(key);
		entries.push([key, values.length === 1 ? values[0]! : values]);
	}

	/** Defines own properties, so that a field named `__proto__` cannot replace the prototype. */
	return Object.fromEntries(entries);
}

/** The text values to send back to the client, without files, and without fields like passwords. */
export function getFormValues(values: FormDataValues, omit: ReadonlyArray<string>): FormValues {
	const entries: Array<[string, string | Array<string>]> = [];

	for (const [key, value] of Object.entries(values)) {
		if (omit.includes(key)) {
			continue;
		}

		if (typeof value === "string") {
			entries.push([key, value]);
		} else if (Array.isArray(value)) {
			entries.push([key, value.filter((entry) => typeof entry === "string")]);
		}
	}

	/** Defines own properties, so that a field named `__proto__` cannot replace the prototype. */
	return Object.fromEntries(entries);
}
