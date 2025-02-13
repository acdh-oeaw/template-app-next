import type { BasicFormField, FormFieldStoredValue } from "@keystatic/core";

import { ImageFieldInput } from "@/lib/keystatic/fields/image/ui";

interface ImageFieldProps {
	defaultValue?: string;
	description?: string;
	label: string;
}

function ImageField(props: ImageFieldProps): BasicFormField<string> {
	const { defaultValue, description, label } = props;

	return {
		kind: "form",
		label,
		Input: ImageFieldInput,
		defaultValue() {
			return defaultValue ?? "";
		},
		parse(value) {
			return parseAsNormalField(value);
		},
		serialize(value) {
			return { value: value === "" ? undefined : value };
		},
		validate(value) {
			return validate(value);
		},
		reader: {
			parse(value) {
				return validate(parseAsNormalField(value));
			},
		},
	};
}

function parseAsNormalField(value: FormFieldStoredValue): string {
	if (value === undefined) {
		return "";
	}
	if (typeof value !== "string") {
		throw new Error("Must be a string");
	}
	return value;
}

function validate(value: string): string {
	return value;
}

export const image = ImageField;
