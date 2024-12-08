import { isNonEmptyArray } from "@acdh-oeaw/lib";
import type { Metadata, ResolvingMetadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { SearchFacets } from "@/app/[locale]/(search)/search/_components/search-facets";
import { SearchField } from "@/app/[locale]/(search)/search/_components/search-field";
import { SearchForm } from "@/app/[locale]/(search)/search/_components/search-form";
import { getSearchFilters } from "@/app/[locale]/(search)/search/_lib/get-search-filters";
import { getSearchResults } from "@/app/[locale]/(search)/search/_lib/get-search-results";
import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import { SearchFiltersProvider } from "@/components/search-filter-context";
import { SubmitButton } from "@/components/submit-button";
import type { Locale } from "@/config/i18n.config";
import { createHref } from "@/lib/create-href";
import { collection } from "@/lib/typesense/collection";

interface SearchPageProps {
	params: Promise<{
		locale: Locale;
	}>;
	searchParams: Promise<SearchParams>;
}

export async function generateMetadata(
	props: Readonly<SearchPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;

	const t = await getTranslations({ locale, namespace: "SearchPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function SearchPage(props: Readonly<SearchPageProps>): Promise<ReactNode> {
	const { params, searchParams } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations("SearchPage");
	const format = await getFormatter();

	const searchFilters = await getSearchFilters(await searchParams);
	const { searchResults, facetValues } = await getSearchResults(searchFilters);

	return (
		<MainContent className="grid grid-cols-[auto_1fr] gap-x-8 p-8 h-full">
			<h1 className="sr-only">{t("title")}</h1>

			<aside className="grid grid-rows-[auto_1fr] gap-y-6">
				<h2>{t("search-filters")}</h2>

				<SearchFiltersProvider searchFilters={searchFilters}>
					<SearchForm action="" className="grid content-start gap-y-6">
						<SearchField label={t("search")} />

						{collection.facetableFields.map((field) => {
							const values = facetValues.get(field);

							if (values == null) return null;

							return (
								<SearchFacets
									key={field}
									field={field}
									label={t(`facets.${field}.label`)}
									values={values}
								/>
							);
						})}

						<SubmitButton>{t("submit")}</SubmitButton>
					</SearchForm>
				</SearchFiltersProvider>
			</aside>

			<section className="grid grid-rows-[auto_1fr] gap-y-6">
				<h2>
					{searchResults.out_of > 0 ? (
						<span>
							{t("search-results")}{" "}
							<span>
								({format.number(searchResults.found)} / {format.number(searchResults.out_of)})
							</span>
						</span>
					) : (
						<span>{t("empty-collection")}</span>
					)}
				</h2>

				{isNonEmptyArray(searchResults.hits) ? (
					<div className="grid content-start gap-y-6">
						<ul className="grid content-start gap-y-2" role="list">
							{searchResults.hits.map((searchResult) => {
								const { id, title } = searchResult.document;

								return (
									<li key={id}>
										<article>
											<h3>{title}</h3>
										</article>
									</li>
								);
							})}
						</ul>

						<nav aria-label={t("pagination")} className="flex gap-x-4 items-center text-tiny">
							<Link
								href={createHref({
									searchParams: {
										...searchFilters,
										offset: Math.max(searchFilters.offset - searchFilters.limit, 0),
									},
								})}
								isDisabled={searchFilters.offset - searchFilters.limit <= 0}
							>
								{t("page-previous")}
							</Link>
							<Link
								href={createHref({
									searchParams: {
										...searchFilters,
										offset: Math.min(
											searchFilters.offset + searchFilters.limit,
											searchResults.found - 1,
										),
									},
								})}
								isDisabled={searchFilters.offset + searchFilters.limit >= searchResults.found}
							>
								{t("page-next")}
							</Link>
						</nav>
					</div>
				) : (
					<div className="grid place-content-center place-items-center text-center">
						<span>{t("nothing-found")}</span>
					</div>
				)}
			</section>
		</MainContent>
	);
}
