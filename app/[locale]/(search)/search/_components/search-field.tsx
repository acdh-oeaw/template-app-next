"use client";

import type { ReactNode } from "react";
import {
	Input,
	Label,
	SearchField as AriaSearchField,
	type SearchFieldProps as AriaSearchFieldProps,
} from "react-aria-components";

import type { SearchFilters } from "@/app/[locale]/(search)/search/_lib/get-search-filters";
import { useSearchFiltersContext } from "@/components/search-filter-context";

interface SearchFieldProps extends Omit<AriaSearchFieldProps, "onChange"> {
	label: ReactNode;
}

export function SearchField(props: Readonly<SearchFieldProps>): ReactNode {
	const { label, ...rest } = props;

	const { searchFilters, setSearchFilters } = useSearchFiltersContext<SearchFilters>();

	function onChange(value: string) {
		setSearchFilters((searchFilters) => {
			return {
				...searchFilters,
				q: value,
				offset: 0,
			};
		});
	}

	return (
		<AriaSearchField {...rest} name="q" onChange={onChange} value={searchFilters.q}>
			<Label>{label}</Label>
			<Input />
		</AriaSearchField>
	);
}
