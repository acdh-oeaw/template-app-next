import { useLocale } from "next-intl";
import Form from "next/form";
import { Fragment, type ReactNode, Suspense } from "react";

import { searchParamsCodec } from "#/app/[locale]/e2e/search-params/search-params.ts";
import { Link } from "#/components/link.tsx";
import { MainContent } from "#/components/main-content.tsx";
import { assertE2eFixture } from "#/lib/e2e/fixtures.ts";
import { getPathname } from "#/lib/i18n/navigation.ts";
import { href } from "#/lib/navigation/href.ts";
import { encodeSearchParams, safeParseSearchParams } from "#/lib/navigation/search-params.ts";

interface SearchParamsFixturePageProps extends PageProps<"/[locale]/e2e/search-params"> {}

export default function SearchParamsFixturePage(props: Readonly<SearchParamsFixturePageProps>): ReactNode {
	assertE2eFixture();

	const { searchParams } = props;

	return (
		<MainContent>
			<h1>Search params</h1>
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

	const locale = useLocale();

	return (
		<Form action={getPathname({ href: href({ pathname: "/e2e/search-params" }), locale })} role="search">
			<label>
				Search term <input defaultValue={query} name="q" type="search" />
			</label>
			<button type="submit">Search</button>
		</Form>
	);
}

interface SearchResultsProps extends Pick<SearchParamsFixturePageProps, "searchParams"> {}

async function SearchResults(props: Readonly<SearchResultsProps>): Promise<ReactNode> {
	const result = safeParseSearchParams(searchParamsCodec, await props.searchParams);

	if (!result.success) {
		return (
			<Fragment>
				<SearchForm />
				<p>The search parameters are invalid.</p>
			</Fragment>
		);
	}

	const { q, page } = result.output;

	if (q == null || q === "") {
		return <SearchForm />;
	}

	return (
		<Fragment>
			<SearchForm query={q} />
			<p>{`Results for “${q}”, page ${String(page)}`}</p>
			<nav aria-label="Pagination">
				{page > 1 ? (
					<Link
						href={href({
							pathname: "/e2e/search-params",
							searchParams: encodeSearchParams(searchParamsCodec, { q, page: page - 1 }),
						})}
					>
						Previous page
					</Link>
				) : null}
				<Link
					href={href({
						pathname: "/e2e/search-params",
						searchParams: encodeSearchParams(searchParamsCodec, { q, page: page + 1 }),
					})}
				>
					Next page
				</Link>
			</nav>
		</Fragment>
	);
}
