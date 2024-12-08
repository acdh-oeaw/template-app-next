import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { SearchFacets } from "@/app/[locale]/search/_components/search-facets";
import { SearchInput } from "@/app/[locale]/search/_components/search-input";
import { SearchProvider } from "@/app/[locale]/search/_components/search-provider";
import { SearchResults } from "@/app/[locale]/search/_components/search-results";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";

interface SearchPageProps {
	params: {
		locale: Locale;
	};
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
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = await getTranslations("SearchPage");

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-20">
				<div className="max-w-text grid gap-y-4">
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{t("title")}
					</h1>
					<p className="font-heading text-small text-text-weak xs:text-heading-4">
						Veniam adipisicing ut consectetur do esse. Non consequat pariatur eiusmod dolor aliquip
						officia voluptate ut aliquip enim anim duis dolore. Labore aute magna officia ullamco
						adipisicing aute laboris sunt nulla voluptate adipisicing non.
					</p>
				</div>
			</section>

			<section className="layout-subgrid relative border-t border-stroke-weak py-16 xs:py-20">
				<SearchProvider>
					<aside>
						<SearchFacets attribute="brand" />
						<SearchFacets attribute="categories" />
					</aside>

					<div>
						<SearchInput label={t("search")} />
					</div>

					<div>
						<SearchResults />
					</div>
				</SearchProvider>
			</section>
		</MainContent>
	);
}
