"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { CheckIcon, XIcon } from "lucide-react";
import { Fragment, type ReactNode, useId } from "react";
import {
	Button,
	Checkbox,
	// CheckboxGroup,
	Group,
	Input,
	Label,
	SearchField,
} from "react-aria-components";
import { useRefinementList, type UseRefinementListProps } from "react-instantsearch-core";

import { createKey } from "@/lib/create-key";

interface SearchFacetsProps extends UseRefinementListProps {
	attribute: "brand" | "categories";
	inputLabel: string;
	label: string;
	/** @default 10 */
	limit?: number;
	/** @default "or" */
	operator?: UseRefinementListProps["operator"];
	showLessLabel: string;
	showMoreLabel: string;
}

export function SearchFacets(props: Readonly<SearchFacetsProps>): ReactNode {
	const { attribute, inputLabel, label, showLessLabel, showMoreLabel } = props;

	const { canToggleShowMore, isShowingMore, items, refine, searchForItems, toggleShowMore } =
		useRefinementList(props);

	const groupLabelId = useId();

	return (
		<Group className="grid content-start gap-y-6">
			<Label className="text-tiny font-strong text-text-weak" elementType="span" id={groupLabelId}>
				{label}
			</Label>

			{/* FIXME: canToggleShowMore is always false */}

			<SearchField
				aria-label={inputLabel}
				className="group grid gap-y-1"
				name={createKey(attribute, "search")}
				onChange={(value) => {
					searchForItems(value);
				}}
			>
				<Group className="relative grid items-center">
					<Input
						className={cn(
							"min-h-8 px-3 py-1 pr-8 text-tiny",
							// "min-h-12 px-4 py-2.5 pr-12 text-small",
							"min-w-0 rounded-2 border border-stroke-strong bg-fill-inverse-strong text-text-strong",
							"interactive focus:focus-outline hover:hover-overlay pressed:press-overlay",
						)}
					/>
					<Button className={cn("absolute justify-self-end pl-1 pr-3", "group-empty:hidden")}>
						<XIcon aria-hidden={true} className="size-4 text-icon-neutral" />
					</Button>
				</Group>
			</SearchField>

			{/* FIXME: how to set all selected values? `refine` expects single values. */}
			{/* <CheckboxGroup
				aria-labelledby={groupLabelId}
				className="grid content-start gap-y-4"
				name={attribute}
				onChange={() => {
					//
				}}
				value={items
					.filter((item) => {
						return item.isRefined;
					})
					.map((item) => {
						return item.value;
					})}
			>
				{items.map((item) => {
					return (
						<Checkbox
							key={item.value}
							className="group flex items-center gap-x-3 text-small text-text-strong"
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
			</CheckboxGroup> */}

			<ul className="grid content-start gap-y-4" role="list">
				{items.map((item) => {
					return (
						<li key={item.value}>
							<Checkbox
								key={item.value}
								className="group flex items-center gap-x-3 text-tiny text-text-strong"
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
													"inline-grid size-6 shrink-0 place-content-center rounded-1 border border-stroke-strong bg-fill-inverse-strong",
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
						</li>
					);
				})}
			</ul>

			<Button
				className={cn(
					"min-h-8 px-3 py-1 text-tiny",
					// "min-h-12 px-4 py-2.5 text-small",
					"rounded-2 border border-stroke-brand-strong font-strong text-text-brand",
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
