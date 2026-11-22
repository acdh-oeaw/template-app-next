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
});
