"use client";

import { useFormatter } from "next-intl";
import type { ReactNode } from "react";

import type { SearchFilters } from "@/app/[locale]/(search)/search/_lib/get-search-filters";
import { useSearchFiltersContext } from "@/components/search-filter-context";
import { defaultVisibleFacetValues } from "@/config/search.config";
import type { CollectionFacetField } from "@/lib/typesense/collection";

interface SearchFacetsProps {
	field: CollectionFacetField;
	label: ReactNode;
	values: Map<string, { count: number; isSelected: boolean }>;
}

export function SearchFacets(props: Readonly<SearchFacetsProps>): ReactNode {
	const { field, label, values } = props;

	const format = useFormatter();

	const { setSearchFilters } = useSearchFiltersContext<SearchFilters>();

	return (
		<div key={field} aria-labelledby={field} className="grid gap-y-1 content-start" role="group">
			<h3 id={field}>{label}</h3>

			<ul className="grid gap-y-1 content-start text-tiny" role="list">
				{Array.from(values)
					.slice(0, defaultVisibleFacetValues)
					.map(([value, { count, isSelected }]) => {
						function onChange() {
							setSearchFilters((searchFilters) => {
								const newValues = new Set(searchFilters[field]);

								if (isSelected) {
									newValues.delete(value);
								} else {
									newValues.add(value);
								}

								return {
									...searchFilters,
									[field]: Array.from(newValues),
									offset: 0,
								};
							});
						}

						return (
							<li key={value}>
								<label className="inline-flex gap-x-2">
									<input
										checked={isSelected}
										name={field}
										onChange={onChange}
										type="checkbox"
										value={value}
									/>
									<span>
										{value} ({format.number(count)})
									</span>
								</label>
							</li>
						);
					})}
			</ul>
		</div>
	);
}
