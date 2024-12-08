"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Group, Input, Label, SearchField } from "react-aria-components";
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
		<SearchField
			className="group grid gap-y-1"
			defaultValue={query}
			name="q"
			onChange={refine}
			onClear={clear}
		>
			<Label className="text-small text-text-strong">{label}</Label>
			<Group className="relative grid items-center">
				<Input
					className={cn(
						"pr-12",
						"min-h-12 rounded-2 border border-stroke-strong bg-fill-inverse-strong px-4 py-2.5 text-small text-text-strong",
						"interactive focus:focus-outline hover:hover-overlay pressed:press-overlay",
					)}
				/>
				<Button className={cn("absolute justify-self-end pl-2 pr-4", "group-empty:hidden")}>
					<XIcon aria-hidden={true} className="size-6 text-icon-neutral" />
				</Button>
			</Group>
		</SearchField>
	);
}
