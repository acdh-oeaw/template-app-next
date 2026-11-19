import * as v from "valibot";

type RawValue = string | Array<string> | undefined;

/** The search params that Next.js passes to pages: repeated keys are arrays. */
type SearchParamsRecord = Record<string, RawValue>;

/** Decodes a search param from the url into a typed value, and encodes a typed value into a search param. */
export interface SearchParam<TValue, TInput> {
	readonly decoder: v.GenericSchema<RawValue, TValue>;
	readonly encoder: v.GenericSchema<TInput | undefined, RawValue>;
}

/** A search param with a single value, which `searchParam.array()` can repeat if it has no default. */
export interface ScalarSearchParam<TItem, TItemInput, THasDefault extends boolean> extends SearchParam<
	THasDefault extends true ? TItem : TItem | undefined,
	TItemInput
> {
	readonly hasDefault: THasDefault;
	readonly item: {
		readonly decoder: v.GenericSchema<string, TItem>;
		readonly schema: v.GenericSchema<TItemInput, TItem>;
		readonly serialize: (value: TItem) => string;
	};
}

type AnySearchParam = SearchParam<unknown, unknown>;

type SearchParamsDefinition<TParams> = { readonly [TKey in keyof TParams]: AnySearchParam };

interface DefaultOption<TValue> {
	/** The value of a missing search param, which encoding leaves out, so that links are canonical. */
	default: TValue;
}

function isEqual(a: unknown, b: unknown): boolean {
	if (Array.isArray(a) && Array.isArray(b)) {
		return a.length === b.length && a.every((item, index) => Object.is(item, b[index]));
	}

	return Object.is(a, b);
}

function createScalar<TItem, TItemInput>(
	decoder: v.GenericSchema<string, TItemInput>,
	schema: v.GenericSchema<TItemInput, TItem>,
	serialize: (value: TItem) => string,
	options?: DefaultOption<TItem>,
): ScalarSearchParam<TItem, TItemInput, boolean> {
	const item = { decoder: v.pipe(decoder, schema), schema, serialize };

	return {
		hasDefault: options != null,
		item,
		decoder: v.pipe(
			v.optional(item.decoder),
			v.transform((value) => value ?? options?.default),
		),
		encoder: v.pipe(
			v.optional(schema),
			v.transform((value) =>
				value === undefined || (options != null && isEqual(value, options.default)) ? undefined : serialize(value),
			),
		),
	};
}

const numberDecoder = v.pipe(
	v.string(),
	v.check((value) => value.trim() !== "" && Number.isFinite(Number(value)), "Invalid number"),
	v.transform(Number),
);

const booleanDecoder = v.pipe(
	v.picklist(["true", "false"]),
	v.transform((value) => value === "true"),
);

function string(): ScalarSearchParam<string, string, false>;
function string(options: DefaultOption<string>): ScalarSearchParam<string, string, true>;
function string<TItem extends string, TItemInput extends string>(
	schema: v.GenericSchema<TItemInput, TItem>,
): ScalarSearchParam<TItem, TItemInput, false>;
function string<TItem extends string, TItemInput extends string>(
	schema: v.GenericSchema<TItemInput, TItem>,
	options: DefaultOption<NoInfer<TItem>>,
): ScalarSearchParam<TItem, TItemInput, true>;
function string(
	schemaOrOptions?: v.GenericSchema<string, string> | DefaultOption<string>,
	options?: DefaultOption<string>,
): ScalarSearchParam<string, string, boolean> {
	if (schemaOrOptions != null && !("kind" in schemaOrOptions)) {
		return createScalar(v.string(), v.string(), String, schemaOrOptions);
	}

	return createScalar(v.string(), schemaOrOptions ?? v.string(), String, options);
}

function number(): ScalarSearchParam<number, number, false>;
function number(options: DefaultOption<number>): ScalarSearchParam<number, number, true>;
function number<TItem extends number, TItemInput extends number>(
	schema: v.GenericSchema<TItemInput, TItem>,
): ScalarSearchParam<TItem, TItemInput, false>;
function number<TItem extends number, TItemInput extends number>(
	schema: v.GenericSchema<TItemInput, TItem>,
	options: DefaultOption<NoInfer<TItem>>,
): ScalarSearchParam<TItem, TItemInput, true>;
function number(
	schemaOrOptions?: v.GenericSchema<number, number> | DefaultOption<number>,
	options?: DefaultOption<number>,
): ScalarSearchParam<number, number, boolean> {
	if (schemaOrOptions != null && !("kind" in schemaOrOptions)) {
		return createScalar(numberDecoder, v.number(), String, schemaOrOptions);
	}

	return createScalar(numberDecoder, schemaOrOptions ?? v.number(), String, options);
}

function boolean(): ScalarSearchParam<boolean, boolean, false>;
function boolean(options: DefaultOption<boolean>): ScalarSearchParam<boolean, boolean, true>;
function boolean(options?: DefaultOption<boolean>): ScalarSearchParam<boolean, boolean, boolean> {
	return createScalar(booleanDecoder, v.boolean(), String, options);
}

/** Repeats a search param, like `?tag=a&tag=b`. Missing search params decode to an empty array. */
function array<TItem, TItemInput>(
	param: ScalarSearchParam<TItem, TItemInput, false>,
): SearchParam<Array<TItem>, ReadonlyArray<TItemInput>> {
	const { item } = param;

	return {
		decoder: v.pipe(
			v.optional(v.union([v.string(), v.array(v.string())])),
			v.transform((value) => (value == null ? [] : typeof value === "string" ? [value] : value)),
			v.array(item.decoder),
		),
		encoder: v.pipe(
			v.optional(v.array(item.schema)),
			v.transform((values) =>
				values == null || values.length === 0 ? undefined : values.map((value) => item.serialize(value)),
			),
		),
	};
}

/**
 * Search params, optionally validated with a valibot schema of the typed value, like
 * `searchParam.number(v.pipe(v.number(), v.integer(), v.minValue(1)), { default: 1 })`. Search params are optional, and
 * decode to `undefined` when missing, unless they have a default.
 */
export const searchParam = { array, boolean, number, string };

/** The search params that a page's `search-params.ts` accepts, created with `createSearchParamsCodec()`. */
export interface SearchParamsCodec<TParams extends SearchParamsDefinition<TParams>> {
	readonly params: TParams;
}

// oxlint-disable-next-line typescript/no-explicit-any -- any codec, `unknown` does not satisfy the constraint
export type AnySearchParamsCodec = SearchParamsCodec<any>;

type DecodedSearchParams<TParams extends SearchParamsDefinition<TParams>> = {
	-readonly [TKey in keyof TParams]: v.InferOutput<TParams[TKey]["decoder"]>;
};

type SearchParamsInput<TParams extends SearchParamsDefinition<TParams>> = {
	readonly [TKey in keyof TParams]?: v.InferInput<TParams[TKey]["encoder"]>;
};

type ParamsOf<TCodec> = TCodec extends SearchParamsCodec<infer TParams> ? TParams : never;

/** The typed values that a codec decodes from the url. */
export type SearchParamsOf<TCodec extends AnySearchParamsCodec> = DecodedSearchParams<ParamsOf<TCodec>>;

/** The typed values that a codec encodes into search params. */
export type SearchParamsInputOf<TCodec extends AnySearchParamsCodec> = SearchParamsInput<ParamsOf<TCodec>>;

declare const encodedBrand: unique symbol;

/**
 * Search params encoded by a codec, which `href()` requires for the page of that codec. The brand is invariant, so that
 * search params of one page are not accepted for another.
 */
export type EncodedSearchParams<TCodec extends AnySearchParamsCodec> = Readonly<
	Record<string, string | ReadonlyArray<string>>
> & { readonly [encodedBrand]: (codec: TCodec) => TCodec };

export function createSearchParamsCodec<const TParams extends SearchParamsDefinition<TParams>>(
	params: TParams,
): SearchParamsCodec<TParams> {
	return { params };
}

interface RunResult {
	output: Record<string, unknown>;
	issues: Array<v.BaseIssue<unknown>>;
}

/**
 * Runs the decoder or encoder of each search param, and collects the issues of invalid ones, which `fallback()` can
 * replace. Not with `v.object()`, which skips the schemas of missing keys whose schema is optional, so defaults would
 * not apply.
 */
function run(
	codec: AnySearchParamsCodec,
	input: Readonly<Record<string, unknown>>,
	schemaOf: (param: AnySearchParam) => v.GenericSchema,
	fallback?: (param: AnySearchParam) => unknown,
): RunResult {
	const output: Record<string, unknown> = {};
	const issues: Array<v.BaseIssue<unknown>> = [];

	for (const [key, param] of Object.entries(codec.params as Record<string, AnySearchParam>)) {
		const value = input[key];
		const result = v.safeParse(schemaOf(param), value);

		if (result.success) {
			output[key] = result.output;
		} else {
			const pathItem: v.ObjectPathItem = { type: "object", origin: "value", input, key, value };

			for (const issue of result.issues) {
				const path: [v.IssuePathItem, ...Array<v.IssuePathItem>] = [pathItem, ...(issue.path ?? [])];

				issues.push({ ...issue, path });
			}

			if (fallback != null) {
				output[key] = fallback(param);
			}
		}
	}

	return { output, issues };
}

/** Like Next.js does for the `searchParams` prop, so that a codec can decode both. */
function toRecord(searchParams: URLSearchParams): SearchParamsRecord {
	const record: Record<string, string | Array<string>> = {};

	for (const key of new Set(searchParams.keys())) {
		const values = searchParams.getAll(key);

		record[key] = values.length === 1 ? values[0]! : values;
	}

	return record;
}

/** Readonly arrays, so that encoded search params can be decoded again. */
type SearchParamsSource = Readonly<Record<string, string | ReadonlyArray<string> | undefined>> | URLSearchParams;

function toInput(searchParams: SearchParamsSource): Readonly<Record<string, unknown>> {
	return searchParams instanceof URLSearchParams ? toRecord(searchParams) : searchParams;
}

export interface SearchParamsWithIssues<TCodec extends AnySearchParamsCodec> {
	values: SearchParamsOf<TCodec>;
	/** The issues of invalid search params, whose values fell back to their default. */
	issues: Array<v.BaseIssue<unknown>>;
}

/** Like `parseSearchParams()`, but also returns the issues of invalid search params, like for a hint on the page. */
export function parseSearchParamsWithIssues<TCodec extends AnySearchParamsCodec>(
	codec: TCodec,
	searchParams: SearchParamsSource,
): SearchParamsWithIssues<TCodec> {
	const { output, issues } = run(
		codec,
		toInput(searchParams),
		(param) => param.decoder,
		(param) => v.parse(param.decoder, undefined),
	);

	return { values: output as SearchParamsOf<TCodec>, issues };
}

/**
 * Decodes the search params of a page with the codec in its `search-params.ts`. Accepts the `searchParams` prop of a
 * page, and the result of `useSearchParams()`. Ignores unknown search params, and falls back to the default of invalid
 * ones, because urls are user input, like old links or edited urls, which should not fail the page.
 */
export function parseSearchParams<TCodec extends AnySearchParamsCodec>(
	codec: TCodec,
	searchParams: SearchParamsSource,
): SearchParamsOf<TCodec> {
	return parseSearchParamsWithIssues(codec, searchParams).values;
}

/**
 * Encodes typed values into search params for `href()`. Leaves out default values, so that links are canonical, and
 * throws for invalid values.
 */
export function encodeSearchParams<TCodec extends AnySearchParamsCodec>(
	codec: TCodec,
	values: SearchParamsInputOf<TCodec>,
): EncodedSearchParams<TCodec> {
	const { output, issues } = run(codec, values, (param) => param.encoder);
	const [first, ...rest] = issues;

	if (first != null) {
		throw new v.ValiError([first, ...rest]);
	}

	return Object.fromEntries(
		Object.entries(output).filter(([, value]) => value !== undefined),
	) as unknown as EncodedSearchParams<TCodec>;
}
