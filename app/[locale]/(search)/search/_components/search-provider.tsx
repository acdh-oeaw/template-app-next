"use client";

import type { ReactNode } from "react";
import { InstantSearchNext as InstantSearch } from "react-instantsearch-nextjs";

import { schema } from "@/lib/typesense/schema";
import { searchClient } from "@/lib/typesense/search-client";

interface SearchProviderProps {
	children: ReactNode;
}

export function SearchProvider(props: Readonly<SearchProviderProps>): ReactNode {
	const { children } = props;

	return (
		<InstantSearch indexName={schema.name} routing={true} searchClient={searchClient}>
			{children}
		</InstantSearch>
	);
}
