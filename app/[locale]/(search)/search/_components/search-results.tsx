"use client";

import type { ReactNode } from "react";
import { useHits } from "react-instantsearch-core";

import type { TypesenseDocument } from "@/lib/typesense/schema";

export function SearchResults(): ReactNode {
	const { items } = useHits<TypesenseDocument>();

	return (
		<ol className="grid divide-y divide-stroke-weak">
			{items.map((item) => {
				const { brand, categories, description, title } = item;

				return (
					<li key={item.objectID}>
						<article className="py-4">
							<h3 className="font-strong text-text-strong">{title}</h3>
							<p className="text-text-weak">{description}</p>
						</article>
					</li>
				);
			})}
		</ol>
	);
}