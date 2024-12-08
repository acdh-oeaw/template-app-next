import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { SearchFacets } from "@/app/[locale]/(search)/search/_components/search-facets";
import { SearchInput } from "@/app/[locale]/(search)/search/_components/search-input";
import { SearchProvider } from "@/app/[locale]/(search)/search/_components/search-provider";
import { SearchResults } from "@/app/[locale]/(search)/search/_components/search-results";
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
		<SearchProvider>
			<div className="grid h-full grid-cols-[20rem_1fr]">
				<aside className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-y-16 overflow-y-auto border-r border-stroke-weak bg-fill-weaker pb-3">
					<div></div>

					<div>
						<div className="px-6 py-3">
							<SearchFacets
								attribute="brand"
								inputLabel={t("filter-facet", { facet: t("facets.brand") })}
								label={t("facets.brand")}
								showLessLabel={t("show-less")}
								showMoreLabel={t("show-more")}
							/>
						</div>

						<hr className="m-6" />

						<div className="px-6 py-3">
							<SearchFacets
								attribute="categories"
								inputLabel={t("filter-facet", { facet: t("facets.categories") })}
								label={t("facets.categories")}
								showLessLabel={t("show-less")}
								showMoreLabel={t("show-more")}
							/>
						</div>
					</div>
				</aside>

				<div className="grid h-full min-h-0 grid-rows-[auto_1fr]">
					<header className="border-b border-stroke-weak">
						<div className="flex min-h-18 items-center justify-end px-8 py-3"></div>
					</header>

					<MainContent className="overflow-y-auto">
						<section className="p-16 xs:py-20">
							<div className="max-w-text grid gap-y-4">
								<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
									{t("title")}
								</h1>
								<p className="font-heading text-small text-text-weak xs:text-heading-4">
									Veniam adipisicing ut consectetur do esse. Non consequat pariatur eiusmod dolor
									aliquip officia voluptate ut aliquip enim anim duis dolore. Labore aute magna
									officia ullamco adipisicing aute laboris sunt nulla voluptate adipisicing non.
								</p>
							</div>
						</section>

						<hr />

						<section className="px-16 py-8">
							<div className="grid gap-y-6">
								<div className="mx-auto w-full max-w-2xl">
									<SearchInput label={t("search")} />
								</div>

								<div className="flex gap-x-8">
									<div>
										<SearchResults />
									</div>
								</div>
							</div>
						</section>
					</MainContent>
				</div>
			</div>
		</SearchProvider>
	);
}
