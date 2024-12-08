import * as v from "valibot";

import { defaultLimit } from "@/config/search.config";
import { ensureArray } from "@/lib/ensure-array";
import { collection } from "@/lib/typesense/collection";

const SearchFiltersSchema = v.object({
	authors: v.fallback(
		v.pipe(v.unknown(), v.transform(ensureArray), v.array(v.pipe(v.string(), v.nonEmpty()))),
		[],
	),
	genres: v.fallback(
		v.pipe(v.unknown(), v.transform(ensureArray), v.array(v.pipe(v.string(), v.nonEmpty()))),
		[],
	),
	q: v.fallback(v.string(), ""),
	sort: v.fallback(v.picklist(collection.sortableFields), "title"),
	"sort-direction": v.fallback(v.picklist(["asc", "desc"]), "asc"),
	limit: v.fallback(
		v.pipe(
			v.string(),
			v.transform(Number),
			v.number(),
			v.integer(),
			v.minValue(1),
			v.maxValue(100),
		),
		defaultLimit,
	),
	offset: v.fallback(
		v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(0)),
		0,
	),
});

export type SearchFilters = v.InferOutput<typeof SearchFiltersSchema>;

export async function getSearchFilters(searchParams: SearchParams) {
	const searchFilters = await v.parseAsync(SearchFiltersSchema, searchParams);

	return searchFilters;
}
