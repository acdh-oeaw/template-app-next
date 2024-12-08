"use client";

import { assert, createUrlSearchParams } from "@acdh-oeaw/lib";
import { createContext, type ReactNode, use, useMemo, useOptimistic, useTransition } from "react";

import { useRouter } from "@/lib/i18n/navigation";

type SearchFilters = Record<string, string | number | boolean | Array<string | number | boolean>>;

interface SearchFiltersContextValue<T extends SearchFilters> {
	isPending: boolean;
	searchFilters: T;
	setSearchFilters: (searchFilters: T | ((searchFilters: T) => T)) => void;
}

const SearchFiltersContext = createContext<SearchFiltersContextValue<SearchFilters> | null>(null);

interface SearchFiltersProviderProps<T extends SearchFilters> {
	children: ReactNode;
	searchFilters: T;
}

export function SearchFiltersProvider<T extends SearchFilters>(
	props: Readonly<SearchFiltersProviderProps<T>>,
): ReactNode {
	const { children, searchFilters } = props;

	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [optimisticSearchFilters, setOptimisticSearchFilters] = useOptimistic(searchFilters);

	const value = useMemo(() => {
		function setSearchFilters(searchFilters: T | ((searchFilters: T) => T)) {
			const newSearchFilters =
				typeof searchFilters === "function"
					? searchFilters(optimisticSearchFilters)
					: searchFilters;

			startTransition(() => {
				setOptimisticSearchFilters(newSearchFilters);
				router.push(`?${String(createUrlSearchParams(newSearchFilters))}`);
			});
		}

		const value = {
			isPending,
			searchFilters: optimisticSearchFilters,
			setSearchFilters,
		};

		return value;
	}, [isPending, optimisticSearchFilters, router, setOptimisticSearchFilters, startTransition]);

	return (
		// @ts-expect-error React context does not know about generic type.
		<SearchFiltersContext.Provider value={value}>{children}</SearchFiltersContext.Provider>
	);
}

export function useSearchFiltersContext<T extends SearchFilters>() {
	const value = use(SearchFiltersContext) as SearchFiltersContextValue<T> | null;

	assert(value != null, "`useSearchFiltersContext` must be used within a `SearchFiltersProvider`.");

	return value;
}
