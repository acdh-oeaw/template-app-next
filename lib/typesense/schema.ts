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
		},
	],
	default_sorting_field: "title",
};

export interface TypesenseDocument {
	title: string;
	description: string;
	categories: Array<string>;
	brand: string;
}
