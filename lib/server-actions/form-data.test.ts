import { describe, expect, test } from "bun:test";

import { getFormDataValues, getFormValues } from "#/lib/server-actions/form-data.ts";

function createFormData(entries: Array<[string, string | File]>): FormData {
	const formData = new FormData();

	for (const [key, value] of entries) {
		formData.append(key, value);
	}

	return formData;
}

describe("getFormDataValues", () => {
	test("returns single values, and arrays for repeated fields", () => {
		const formData = createFormData([
			["name", "Ada"],
			["tags", "a"],
			["tags", "b"],
		]);

		expect(getFormDataValues(formData)).toStrictEqual({ name: "Ada", tags: ["a", "b"] });
	});

	test("leaves out the fields that Next.js adds", () => {
		const formData = createFormData([
			["$ACTION_ID_abc", ""],
			["$ACTION_REF_1", ""],
			["name", "Ada"],
		]);

		expect(getFormDataValues(formData)).toStrictEqual({ name: "Ada" });
	});

	test("keeps a field named `__proto__` as an own property", () => {
		const formData = createFormData([
			["__proto__", "a"],
			["__proto__", "b"],
		]);

		const values = getFormDataValues(formData);

		expect(Object.getPrototypeOf(values)).toBe(Object.prototype);
		expect(Object.hasOwn(values, "__proto__")).toBe(true);
		expect("length" in values).toBe(false);
	});
});

describe("getFormValues", () => {
	test("leaves out files and omitted fields", () => {
		const file = new File(["content"], "file.txt");
		const values = getFormDataValues(
			createFormData([
				["name", "Ada"],
				["password", "secret"],
				["file", file],
				["tags", "a"],
				["tags", file],
			]),
		);

		expect(getFormValues(values, ["password"])).toStrictEqual({ name: "Ada", tags: ["a"] });
	});

	test("keeps a field named `__proto__` as an own property", () => {
		const values = getFormDataValues(
			createFormData([
				["__proto__", "a"],
				["__proto__", "b"],
			]),
		);

		const formValues = getFormValues(values, []);

		expect(Object.getPrototypeOf(formValues)).toBe(Object.prototype);
		expect(Object.hasOwn(formValues, "__proto__")).toBe(true);
	});
});
