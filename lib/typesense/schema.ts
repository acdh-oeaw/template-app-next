import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

import { env } from "@/config/env.config";

export const schema: CollectionCreateSchema = {
	name: env.NEXT_PUBLIC_TYPESENSE_COLLECTION,
	fields: [
		{
			name: "title",
			type: "string",
			sort: true,
		},
		{
			name: "description",
			type: "string",
		},
		{
			name: "categories",
			type: "string[]",
			facet: true,
		},
		{
			name: "brand",
			type: "string",
			facet: true,
			sort: true,
		},
	],
	/** Must be a `int32` or `float` field. */
	// default_sorting_field:
};

export interface CollectionItem {
	id: string;
	title: string;
	description: string;
	categories: Array<string>;
	brand: string;
}

export const collectionQueryFields = ["description", "title"] as const;

export type CollectionQueryField = (typeof collectionQueryFields)[number];

export const collectionFacetFields = ["brand", "categories"] as const;

export type CollectionFacetField = (typeof collectionFacetFields)[number];

export const collectionSortFields = ["brand", "title"] as const;

export type CollectionSortField = (typeof collectionSortFields)[number];
