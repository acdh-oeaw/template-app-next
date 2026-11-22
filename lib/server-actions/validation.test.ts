import { describe, expect, test } from "bun:test";

import * as v from "valibot";

import { getValidationErrors } from "#/lib/server-actions/validation.ts";

function getIssues(schema: v.GenericSchema, input: unknown): Array<v.BaseIssue<unknown>> {
	const result = v.safeParse(schema, input, { abortEarly: false });

	if (result.success) {
		throw new Error("Expected the input to be invalid.");
	}

	return result.issues;
}

describe("getValidationErrors", () => {
	test("keys issues by field name", () => {
		const schema = v.object({ name: v.pipe(v.string(), v.nonEmpty("Enter a name.")) });

		expect(getValidationErrors(getIssues(schema, { name: "" }))).toStrictEqual({
			fieldErrors: { name: ["Enter a name."] },
			rootErrors: [],
		});
	});

	test("shows issues of items of a repeated field on the field, once each", () => {
		const schema = v.object({ tags: v.array(v.pipe(v.string(), v.nonEmpty("Enter a tag."))) });

		expect(getValidationErrors(getIssues(schema, { tags: ["", "a", ""] }))).toStrictEqual({
			fieldErrors: { tags: ["Enter a tag."] },
			rootErrors: [],
		});
	});

	test("returns issues without a field as root errors", () => {
		const schema = v.pipe(
			v.object({ from: v.number(), to: v.number() }),
			v.check((input) => input.from <= input.to, "The start must be before the end."),
		);

		expect(getValidationErrors(getIssues(schema, { from: 2, to: 1 }))).toStrictEqual({
			fieldErrors: {},
			rootErrors: ["The start must be before the end."],
		});
	});

	test("keeps a field named `__proto__` as an own property", () => {
		const schema = v.object({ ["__proto__"]: v.pipe(v.string(), v.nonEmpty("Enter a value.")) });
		const issues = getIssues(schema, JSON.parse('{"__proto__":""}'));

		const { fieldErrors } = getValidationErrors(issues);

		expect(Object.getPrototypeOf(fieldErrors)).toBe(Object.prototype);
		expect(Object.hasOwn(fieldErrors, "__proto__")).toBe(true);
	});
});
