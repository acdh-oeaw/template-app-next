"use client";

import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Input, Label, SearchField } from "react-aria-components";
import { useInstantSearch, useSearchBox } from "react-instantsearch-core";

// import { SearchForm as Form } from "@/components/search-form";

interface SearchInputProps {
	label: string;
}

export function SearchInput(props: Readonly<SearchInputProps>): ReactNode {
	const { label } = props;

	const { status } = useInstantSearch();
	const { clear, query, refine } = useSearchBox();

	const _isSearchStalled = status === "stalled";

	return (
		<SearchField defaultValue={query} name="q" onChange={refine} onClear={clear}>
			<Label>{label}</Label>
			<Input />
			<Button>
				<XIcon aria-hidden={true} className="size-5" />
			</Button>
		</SearchField>
	);
}
