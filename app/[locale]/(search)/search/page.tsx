import { isNonNullable, keyByToMap } from "@acdh-oeaw/lib";
import type { Metadata, ResolvingMetadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import * as v from "valibot";

import { MainContent } from "@/components/main-content";
import { SearchForm } from "@/components/search-form";
import { SubmitButton } from "@/components/submit-button";
import type { Locale } from "@/config/i18n.config";
import { maxFacetValues } from "@/config/search.config";
import { ensureArray } from "@/lib/ensure-array";
import {
	type CollectionFacetField,
	collectionFacetFields,
	type CollectionItem,
	collectionQueryFields,
	collectionSortFields,
	schema,
} from "@/lib/typesense/schema";
import { createClient } from "@/lib/typesense/search-client";

const SearchFiltersSchema = v.object({
	brand: v.fallback(
		v.pipe(v.unknown(), v.transform(ensureArray), v.array(v.pipe(v.string(), v.nonEmpty()))),
		[],
	),
	categories: v.fallback(
		v.pipe(v.unknown(), v.transform(ensureArray), v.array(v.pipe(v.string(), v.nonEmpty()))),
		[],
	),
	q: v.fallback(v.string(), ""),
	sort: v.fallback(v.picklist(collectionSortFields), "title"),
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
		10,
	),
	offset: v.fallback(
		v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(0)),
		0,
	),
});

interface SearchPageProps {
	params: {
		locale: Locale;
	};
	searchParams: SearchParams;
}

export async function generateMetadata(
	props: Readonly<SearchPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const t = await getTranslations({ locale, namespace: "SearchPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function SearchPage(props: Readonly<SearchPageProps>): Promise<ReactNode> {
	const { params, searchParams } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = await getTranslations("SearchPage");
	const format = await getFormatter();

	const searchFilters = await v.parseAsync(SearchFiltersSchema, searchParams);

	const searchClient = createClient();

	function createFacetFilter(field: CollectionFacetField) {
		const values = searchFilters[field].sort().map((value) => {
			return `\`${value}\``;
		});

		if (values.length === 0) {
			return null;
		}

		return `${field}:=[${values.join(",")}]`;
	}

	const facetFilters = {
		brand: createFacetFilter("brand"),
		categories: createFacetFilter("categories"),
	};

	/**
	 * @see https://typesense.org/docs/27.1/api/search.html
	 * @see https://typesense.org/docs/27.1/api/federated-multi-search.html
	 * @see https://typesense.org/docs/guide/faqs.html
	 * @see https://github.com/typesense/typesense/issues/2131
	 */
	const searchResponses = await searchClient.multiSearch.perform<
		[CollectionItem, CollectionItem, CollectionItem]
	>(
		{
			searches: [
				{
					facet_by: collectionFacetFields.join(","),
					filter_by: [facetFilters.brand, facetFilters.categories]
						.filter(isNonNullable)
						.join(" AND "),
				},
				{
					facet_by: "brand",
					/**
					 * Apply all filters *except* for the current `facet_by` field, to get
					 * all possible unfiltered facet values.
					 */
					filter_by: [facetFilters.categories].filter(isNonNullable).join(" AND "),
					limit: 0,
				},
				{
					facet_by: "categories",
					/**
					 * Apply all filters *except* for the current `facet_by` field, to get
					 * all possible unfiltered facet values.
					 */
					filter_by: [facetFilters.brand].filter(isNonNullable).join(" AND "),
					limit: 0,
				},
			],
		},
		{
			collection: schema.name,
			q: searchFilters.q,
			query_by: collectionQueryFields.join(","),
			sort_by: `${searchFilters.sort}:${searchFilters["sort-direction"]}`,
			max_facet_values: maxFacetValues,
			limit: searchFilters.limit,
			offset: searchFilters.offset,
		},
	);

	const [searchResults, allBrandFacetValues, allCategoryFacetValues] = searchResponses.results;

	// TODO: merge filtered and unfiltered facet values, and sort selected values to top
	const filteredFacetValues = keyByToMap(searchResults.facet_counts ?? [], (facet) => {
		return facet.field_name;
	});

	const facetValues = new Map([
		["brand", allBrandFacetValues.facet_counts?.at(0)] as const,
		["categories", allCategoryFacetValues.facet_counts?.at(0)] as const,
	]);

	return (
		<MainContent className="grid grid-cols-[auto_1fr] gap-x-8 p-8">
			<h1 className="sr-only">Search</h1>

			<section className="grid content-start gap-y-6">
				<h2>Search filters</h2>

				<SearchForm className="grid content-start gap-y-6">
					<label>
						<span>Search</span>
						<input defaultValue={searchFilters.q} name="q" type="search" />
					</label>

					<div aria-labelledby="categories-facets" className="grid gap-y-2" role="group">
						<h3 id="categories-facets">Categories</h3>

						<div className="grid gap-y-1">
							{facetValues.get("categories")?.counts.map((facet) => {
								return (
									<label key={facet.value}>
										<input
											defaultChecked={searchFilters.categories.includes(facet.value)}
											name="categories"
											type="checkbox"
											value={facet.value}
										/>
										<span>
											{facet.value} ({facet.count})
										</span>
									</label>
								);
							})}
						</div>
					</div>

					<div aria-labelledby="brand-facets" className="grid gap-y-2" role="group">
						<h3 id="brand-facets">Brands</h3>

						<div className="grid gap-y-1">
							{facetValues.get("brand")?.counts.map((facet) => {
								return (
									<label key={facet.value}>
										<input
											defaultChecked={searchFilters.brand.includes(facet.value)}
											name="brand"
											type="checkbox"
											value={facet.value}
										/>
										<span>
											{facet.value} ({facet.count})
										</span>
									</label>
								);
							})}
						</div>
					</div>

					<SubmitButton>Search</SubmitButton>
				</SearchForm>
			</section>

			<section className="grid content-start gap-y-6">
				<h2>
					Search results ({searchResults.found} / {searchResults.out_of})
				</h2>

				<ul className="grid content-start gap-y-2" role="list">
					{searchResults.hits?.map((searchResult) => {
						const { brand, categories, description, id, title } = searchResult.document;

						return (
							<li key={id}>
								<article>
									<h3>{title}</h3>
									<div>{description}</div>
									<div>{brand}</div>
									<div>{format.list(categories)}</div>
								</article>
							</li>
						);
					})}
				</ul>
			</section>
		</MainContent>
	);
}
