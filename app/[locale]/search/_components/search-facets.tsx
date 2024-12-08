"use client";

import type { ReactNode } from "react";
import { useRefinementList, type UseRefinementListProps } from "react-instantsearch-core";

interface SearchFacetsProps extends UseRefinementListProps {
	attribute: "brand" | "categories";
	/** @default 10 */
	limit?: number;
	/** @default "or" */
	operator?: UseRefinementListProps["operator"];
}

export function SearchFacets(props: Readonly<SearchFacetsProps>): ReactNode {
	const { canToggleShowMore, isShowingMore, items, refine, searchForItems, toggleShowMore } =
		useRefinementList(props);

	return (
		<div>
			<input
				onChange={(event) => {
					searchForItems(event.currentTarget.value);
				}}
				type="search"
			/>

			<ul>
				{items.map((item) => {
					return (
						<li key={item.label}>
							<label>
								<input
									checked={item.isRefined}
									name={props.attribute}
									onChange={() => {
										refine(item.value);
									}}
									type="checkbox"
									value={item.value}
								/>
								<span>{item.label}</span>
								<span>({item.count})</span>
							</label>
						</li>
					);
				})}
			</ul>

			<button disabled={!canToggleShowMore} onClick={toggleShowMore} type="button">
				{isShowingMore ? "Show less" : "Show more"}
			</button>
		</div>
	);
}
