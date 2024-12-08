"use client";

import type { ComponentProps, ReactNode } from "react";

import type { SearchFilters } from "@/app/[locale]/(search)/search/_lib/get-search-filters";
import { useSearchFiltersContext } from "@/components/search-filter-context";
import { SearchForm as Form } from "@/components/search-form";

interface SearchFormProps extends ComponentProps<typeof Form> {}

export function SearchForm(props: SearchFormProps): ReactNode {
	const { isPending } = useSearchFiltersContext<SearchFilters>();

	return <Form {...props} data-status={isPending ? "pending" : "idle"} />;
}
