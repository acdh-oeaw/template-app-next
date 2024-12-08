"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { CheckIcon, XIcon } from "lucide-react";
import { Fragment, type ReactNode, useId } from "react";
import {
	Button,
	Checkbox,
	CheckboxGroup,
	Group,
	Input,
	Label,
	SearchField,
} from "react-aria-components";
import { useRefinementList, type UseRefinementListProps } from "react-instantsearch-core";

import { createKey } from "@/lib/create-key";

interface SearchFacetsProps extends UseRefinementListProps {
	attribute: "brand" | "categories";
	label: string;
	/** @default 10 */
	limit?: number;
	/** @default "or" */
	operator?: UseRefinementListProps["operator"];
	showLessLabel: string;
	showMoreLabel: string;
}

export function SearchFacets(props: Readonly<SearchFacetsProps>): ReactNode {
	const { attribute, label, showLessLabel, showMoreLabel } = props;

	const { canToggleShowMore, isShowingMore, items, refine, searchForItems, toggleShowMore } =
		useRefinementList(props);

	const groupLabelId = useId();

	return (
		<Group className="grid content-start gap-y-6">
			<Label className="text-small text-text-strong" elementType="span" id={groupLabelId}>
				{label}
			</Label>

			{/* FIXME: canToggleShowMore is always false */}

			<SearchField
				aria-labelledby={groupLabelId}
				className="group grid gap-y-1"
				name={createKey(attribute, "search")}
				onChange={(value) => {
					searchForItems(value);
				}}
			>
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

			<CheckboxGroup
				aria-labelledby={groupLabelId}
				className="grid content-start gap-y-4"
				name={attribute}
			>
				{items.map((item) => {
					return (
						<Checkbox
							key={item.value}
							className="group flex items-center gap-x-3 text-small text-text-strong"
							isSelected={item.isRefined}
							onChange={() => {
								refine(item.value);
							}}
							value={item.value}
						>
							{({ isSelected }) => {
								return (
									<Fragment>
										<div
											className={cn(
												"inline-grid size-8 shrink-0 place-content-center rounded-1 border border-stroke-strong bg-fill-inverse-strong",
												"group-focus-visible:focus-outline",
												"group-selected:border-stroke-selected group-selected:bg-fill-selected group-selected:text-text-inverse-strong",
											)}
										>
											{isSelected ? <CheckIcon aria-hidden={true} className="size-6" /> : null}
										</div>
										<span>
											{item.label}
											<span className="ml-2">({item.count})</span>
										</span>
									</Fragment>
								);
							}}
						</Checkbox>
					);
				})}
			</CheckboxGroup>

			<Button
				className={cn(
					"min-h-12 rounded-2 border border-stroke-brand-strong px-4 py-2.5 text-text-brand",
					"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay disabled:border-stroke-disabled disabled:text-text-disabled",
				)}
				isDisabled={!canToggleShowMore}
				onPress={toggleShowMore}
			>
				{isShowingMore ? showLessLabel : showMoreLabel}
			</Button>
		</Group>
	);
}
