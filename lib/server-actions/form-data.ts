import type { FormValues } from "#/lib/server-actions/action-state.ts";

export type FormDataValues = Record<string, FormDataEntryValue | Array<FormDataEntryValue>>;

/**
 * A field with several values, like a group of checkboxes, becomes an array, but only when more than one is set, so
 * schemas for such fields should accept a single value too.
 */
export function getFormDataValues(formData: FormData): FormDataValues {
	const values: FormDataValues = {};

	for (const key of new Set(formData.keys())) {
		/** Next.js adds these fields to forms that are submitted without JavaScript. */
		if (key.startsWith("$ACTION")) {
			continue;
		}

		const entries = formData.getAll(key);
		values[key] = entries.length === 1 ? entries[0]! : entries;
	}

	return values;
}

/** The text values to send back to the client, without files, and without fields like passwords. */
export function getFormValues(values: FormDataValues, omit: ReadonlyArray<string>): FormValues {
	const formValues: FormValues = {};

	for (const [key, value] of Object.entries(values)) {
		if (omit.includes(key)) {
			continue;
		}

		if (typeof value === "string") {
			formValues[key] = value;
		} else if (Array.isArray(value)) {
			formValues[key] = value.filter((entry) => typeof entry === "string");
		}
	}

	return formValues;
}
