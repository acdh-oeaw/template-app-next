import type { Metadata } from "next";
import { useLocale, useExtracted as useTranslations } from "next-intl";
import { getExtracted as getTranslations } from "next-intl/server";
import Form from "next/form";
import { Fragment, type ReactNode, Suspense } from "react";

import { searchParamsCodec } from "#/app/[locale]/search/search-params.ts";
import { Link } from "#/components/link.tsx";
import { MainContent } from "#/components/main-content.tsx";
import { env } from "#/lib/env/server.ts";
import { createPageMetadata } from "#/lib/metadata/create-page-metadata.ts";
import { href } from "#/lib/navigation/href.ts";
import { getPathname } from "#/lib/navigation/navigation.ts";
import { encodeSearchParams, parseSearchParams } from "#/lib/navigation/search-params.ts";
import { getTypesenseClient } from "#/lib/typesense/get-typesense-client.ts";
import { searchDocuments } from "#/services/search/search-documents.ts";

interface SearchPageProps extends PageProps<"/[locale]/search"> {}

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations();

	return createPageMetadata({ href: href({ pathname: "/search" }), title: t("Search") });
}

export default function SearchPage(props: Readonly<SearchPageProps>): ReactNode {
	const { searchParams } = props;

	const t = useTranslations();

	return (
		<MainContent>
			<h1>{t("Search")}</h1>
			{/* Not the form, because text entered into the fallback would be lost when the results stream in. */}
			<Suspense fallback={null}>
				<SearchResults searchParams={searchParams} />
			</Suspense>
		</MainContent>
	);
}

interface SearchFormProps {
	query?: string;
}

/** Navigates on the client to this page with the query only, which resets the page number. */
function SearchForm(props: Readonly<SearchFormProps>): ReactNode {
	const { query } = props;

	const t = useTranslations();
	const locale = useLocale();

	return (
		<Form action={getPathname({ href: href({ pathname: "/search" }), locale })} role="search">
			<label>
				{t("Search term")} <input defaultValue={query} name="q" type="search" />
			</label>
			<button type="submit">{t("Search")}</button>
		</Form>
	);
}

interface SearchResultsProps extends Pick<SearchPageProps, "searchParams"> {}

async function SearchResults(props: Readonly<SearchResultsProps>): Promise<ReactNode> {
	const { q, page } = parseSearchParams(searchParamsCodec, await props.searchParams);

	if (q == null || q === "") {
		return <SearchForm />;
	}

	const t = await getTranslations();
	const result = await searchDocuments(
		{ query: q, page },
		{ client: getTypesenseClient(), collection: env.TYPESENSE_COLLECTION },
	);

	switch (result.status) {
		case "not-indexed": {
			return (
				<Fragment>
					<SearchForm query={q} />
					<p>{t("The search index is not available yet.")}</p>
				</Fragment>
			);
		}

		case "found": {
			return (
				<Fragment>
					<SearchForm query={q} />
					<p>{t("{count, plural, =0 {No results} =1 {1 result} other {# results}}", { count: result.total })}</p>
					<ul>
						{result.documents.map((document) => (
							<li key={document.id}>
								<h2>{document.title}</h2>
								<p>{document.body}</p>
							</li>
						))}
					</ul>
					{result.pageCount > 1 ? (
						<nav aria-label={t("Pagination")}>
							{result.page > 1 ? (
								<Link
									href={href({
										pathname: "/search",
										searchParams: encodeSearchParams(searchParamsCodec, { q, page: result.page - 1 }),
									})}
								>
									{t("Previous page")}
								</Link>
							) : null}{" "}
							{result.page < result.pageCount ? (
								<Link
									href={href({
										pathname: "/search",
										searchParams: encodeSearchParams(searchParamsCodec, { q, page: result.page + 1 }),
									})}
								>
									{t("Next page")}
								</Link>
							) : null}
						</nav>
					) : null}
				</Fragment>
			);
		}
	}
}
