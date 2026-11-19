import { describe, expect, test } from "bun:test";

import * as v from "valibot";

import {
	createSearchParamsCodec,
	type EncodedSearchParams,
	encodeSearchParams,
	parseSearchParams,
	safeParseSearchParams,
	searchParam,
	type SearchParamsOf,
} from "#/lib/navigation/search-params.ts";

const codec = createSearchParamsCodec({
	q: searchParam.string(v.pipe(v.string(), v.trim())),
	page: searchParam.number(v.pipe(v.number(), v.integer(), v.minValue(1)), { default: 1 }),
	sort: searchParam.string(v.picklist(["new", "old"]), { default: "new" }),
	tag: searchParam.array(searchParam.string()),
	ids: searchParam.array(searchParam.number(v.pipe(v.number(), v.integer()))),
	isDraft: searchParam.boolean(),
});

const defaults = { q: undefined, page: 1, sort: "new" as const, tag: [], ids: [], isDraft: undefined };

describe("parseSearchParams", () => {
	test("decodes the searchParams prop of a page into typed values", () => {
		expect(
			parseSearchParams(codec, { q: " a b ", page: "2", sort: "old", tag: ["x", "y"], ids: "3", isDraft: "true" }),
		).toStrictEqual({ q: "a b", page: 2, sort: "old", tag: ["x", "y"], ids: [3], isDraft: true });
	});

	test("decodes URLSearchParams like Next.js, with arrays for repeated keys", () => {
		expect(parseSearchParams(codec, new URLSearchParams("q=a+b&tag=x&page=3&tag=y&ids=1"))).toStrictEqual({
			...defaults,
			q: "a b",
			page: 3,
			tag: ["x", "y"],
			ids: [1],
		});
	});

	test("decodes missing search params to defaults, or undefined", () => {
		expect(parseSearchParams(codec, {})).toStrictEqual(defaults);
		expect(parseSearchParams(codec, new URLSearchParams())).toStrictEqual(defaults);
	});

	test("ignores unknown search params", () => {
		expect(parseSearchParams(codec, { q: "a", utm_source: "b" })).toStrictEqual({ ...defaults, q: "a" });
	});

	test("throws for invalid search params", () => {
		for (const searchParams of [
			{ page: "0" },
			{ page: "1.5" },
			{ page: "abc" },
			{ page: "" },
			{ page: ["1", "2"] },
			{ q: ["a", "b"] },
			{ sort: "top" },
			{ ids: ["1", "x"] },
			{ isDraft: "yes" },
		]) {
			expect(() => parseSearchParams(codec, searchParams)).toThrow(v.ValiError);
		}
	});
});

describe("safeParseSearchParams", () => {
	test("returns the typed values of valid search params", () => {
		expect(safeParseSearchParams(codec, { page: "2" })).toStrictEqual({
			success: true,
			output: { ...defaults, page: 2 },
		});
	});

	test("returns the issues of invalid search params instead of throwing", () => {
		const result = safeParseSearchParams(codec, new URLSearchParams("page=0"));

		expect(result.success).toBe(false);
		expect(result.issues?.[0].path?.[0]?.key).toBe("page");
	});
});

describe("encodeSearchParams", () => {
	test("encodes typed values into search params", () => {
		expect<object>(
			encodeSearchParams(codec, { q: "a b", page: 2, sort: "old", tag: ["x", "y"], ids: [3], isDraft: false }),
		).toStrictEqual({ q: "a b", page: "2", sort: "old", tag: ["x", "y"], ids: ["3"], isDraft: "false" });
	});

	test("leaves out default values, missing values and empty arrays, so that links are canonical", () => {
		expect<object>(encodeSearchParams(codec, { q: "a", page: 1, sort: "new", tag: [] })).toStrictEqual({ q: "a" });
		expect<object>(encodeSearchParams(codec, {})).toStrictEqual({});
	});

	test("applies the schema, like trimming", () => {
		expect<object>(encodeSearchParams(codec, { q: " a " })).toStrictEqual({ q: "a" });
	});

	test("throws for invalid values", () => {
		expect(() => encodeSearchParams(codec, { page: 0 })).toThrow(v.ValiError);
		expect(() => encodeSearchParams(codec, { page: 1.5 })).toThrow(v.ValiError);
		expect(() => encodeSearchParams(codec, { page: Number.NaN })).toThrow(v.ValiError);
		expect(() => encodeSearchParams(codec, { ids: [1, 1.5] })).toThrow(v.ValiError);
	});

	test("round-trips with parseSearchParams", () => {
		const values = { q: "a&b", page: 3, sort: "old", tag: ["x", "y z"], ids: [1, -2], isDraft: true } as const;

		expect(parseSearchParams(codec, encodeSearchParams(codec, values))).toStrictEqual({
			...values,
			tag: ["x", "y z"],
			ids: [1, -2],
		});
	});

	test("checks types at compile time", () => {
		expect(codecTypeTests).toBeFunction();
	});
});

const otherCodec = createSearchParamsCodec({ page: searchParam.number() });

/** Only type checked, not run. */
function codecTypeTests() {
	const values: {
		q: string | undefined;
		page: number;
		sort: "new" | "old";
		tag: Array<string>;
		ids: Array<number>;
		isDraft: boolean | undefined;
	} = parseSearchParams(codec, {});
	const output: SearchParamsOf<typeof codec> = values;
	// @ts-expect-error -- unknown output key
	void parseSearchParams(codec, {}).other;
	// @ts-expect-error -- typed values, not strings
	encodeSearchParams(codec, { page: "2" });
	// @ts-expect-error -- the value is not allowed by the schema
	encodeSearchParams(codec, { sort: "top" });
	// @ts-expect-error -- unknown search param
	encodeSearchParams(codec, { other: "1" });
	const tags: ReadonlyArray<string> = ["x"];
	encodeSearchParams(codec, { tag: tags });
	// @ts-expect-error -- search params of another codec
	const other: EncodedSearchParams<typeof codec> = encodeSearchParams(otherCodec, { page: 2 });
	// @ts-expect-error -- plain records are not encoded
	const plain: EncodedSearchParams<typeof codec> = { page: "2" };
	// @ts-expect-error -- arrays need an item without a default
	searchParam.array(searchParam.number({ default: 1 }));
	// @ts-expect-error -- the default must match the schema
	searchParam.string(v.picklist(["new", "old"]), { default: "top" });
	// @ts-expect-error -- a string schema for a number param
	searchParam.number(v.string());
	void [output, other, plain];
}
