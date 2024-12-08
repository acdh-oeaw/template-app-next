import { isNonNullable, keyByToMap } from "@acdh-oeaw/lib";
import type { MultiSearchRequestSchema } from "typesense/lib/Typesense/MultiSearch";

import type { SearchFilters } from "@/app/[locale]/(search)/search/_lib/get-search-filters";
import { maxFacetValues } from "@/config/search.config";
import {
	collection,
	type CollectionDocument,
	type CollectionFacetField,
} from "@/lib/typesense/collection";
import { createTypesenseClient } from "@/lib/typesense/create-typesense-client";

export async function getSearchResults(searchFilters: SearchFilters) {
	const client = createTypesenseClient();

	function createFacetFilter(field: CollectionFacetField) {
		const values = searchFilters[field]
			.sort((a, z) => {
				return a.localeCompare(z);
			})
			.map((value) => {
				return `\`${value}\``;
			});

		if (values.length === 0) {
			return null;
		}

		return `${field}:=[${values.join(",")}]`;
	}

	const facetFilters: Partial<Record<CollectionFacetField, string>> = {};

	collection.facetableFields.forEach((field) => {
		const filter = createFacetFilter(field);

		if (filter) {
			facetFilters[field] = filter;
		}
	});

	const facetFilterFields = Object.keys(facetFilters) as Array<CollectionFacetField>;

	function createFacetSearches() {
		const searches: Array<MultiSearchRequestSchema> = [];

		facetFilterFields.forEach((facetField) => {
			const filters: Array<string> = [];

			Object.entries(facetFilters).forEach(([field, filter]) => {
				/**
				 * Apply all filters *except* for the current `facet_by` field, to get
				 * all possible unfiltered facet values.
				 */
				if (field !== facetField) {
					filters.push(filter);
				}
			});

			// if (filters.length === 0) {
			// 	return;
			// }

			searches.push({
				facet_by: facetField,
				filter_by: filters.join(" AND "),
				limit: 0,
			});
		});

		return searches;
	}

	/**
	 * @see https://typesense.org/docs/27.1/api/search.html
	 * @see https://typesense.org/docs/27.1/api/federated-multi-search.html
	 * @see https://typesense.org/docs/guide/faqs.html
	 * @see https://github.com/typesense/typesense/issues/2131
	 */
	const searchResponses = await client.multiSearch.perform<
		[CollectionDocument, CollectionDocument, CollectionDocument]
	>(
		{
			searches: [
				{
					facet_by: collection.facetableFields.join(","),
					filter_by: Object.values(facetFilters).filter(isNonNullable).join(" AND "),
				},
				...createFacetSearches(),
			],
		},
		{
			collection: collection.name,
			q: searchFilters.q,
			query_by: collection.queryableFields.join(","),
			sort_by: `${searchFilters.sort}:${searchFilters["sort-direction"]}`,
			max_facet_values: maxFacetValues,
			limit: searchFilters.limit,
			offset: searchFilters.offset,
		},
	);

	const [searchResults, ...allFacetValues] = searchResponses.results;

	const filteredFacetFields = new Map<CollectionFacetField, Map<string, { count: number }>>();
	searchResults.facet_counts?.forEach((facet) => {
		const field = facet.field_name as CollectionFacetField;
		const values = keyByToMap(facet.counts, (count) => {
			return count.value;
		});
		filteredFacetFields.set(field, values);
	});

	const unfilteredFacetFields = new Map<CollectionFacetField, Map<string, { count: number }>>();
	allFacetValues.forEach((searchResults, index) => {
		/** Typesense guarantees order. */
		const field = facetFilterFields[index]!;
		const values = keyByToMap(searchResults.facet_counts?.at(0)?.counts ?? [], (count) => {
			return count.value;
		});
		unfilteredFacetFields.set(field, values);
	});

	const mergedFacetFields = new Map<
		CollectionFacetField,
		Map<string, { count: number; isSelected: boolean }>
	>();
	collection.facetableFields.forEach((field) => {
		const selected = new Set(searchFilters[field]);
		const filtered = filteredFacetFields.get(field);
		const unfiltered = unfilteredFacetFields.get(field);
		const merged = new Map<string, { count: number; isSelected: boolean }>();

		selected.forEach((value) => {
			const count = filtered?.get(value);

			/** Typesense does not guarantee that selected facet values are included in the response. */
			if (count == null) {
				merged.set(value, { count: 0, isSelected: true });
			} else {
				merged.set(value, { count: count.count, isSelected: true });
			}
		});

		if (unfiltered != null) {
			unfiltered.forEach((count, value) => {
				if (!merged.has(value)) {
					merged.set(value, { count: count.count, isSelected: false });
				}
			});
		} else {
			filtered?.forEach((count, value) => {
				if (!merged.has(value)) {
					merged.set(value, { count: count.count, isSelected: false });
				}
			});
		}

		mergedFacetFields.set(field, merged);
	});

	return {
		searchResults,
		facetValues: mergedFacetFields,
	};
}
