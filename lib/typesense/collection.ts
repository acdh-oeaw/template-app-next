import { env } from "@/config/env.config";
import { createCollection } from "@/lib/typesense/create-collection";

export const collection = createCollection({
	name: env.NEXT_PUBLIC_TYPESENSE_COLLECTION,
	fields: [
		{ name: "title", type: "string" },
		{ name: "authors", type: "string[]" },
		{ name: "publication-date", type: "int64" },
		{ name: "description", type: "string" },
		{ name: "genres", type: "string[]" },
	],
	queryableFields: ["title", "description"],
	facetableFields: ["authors", "genres"],
	sortableFields: ["title", "publication-date"],
});

export type CollectionQueryield = (typeof collection)["queryableFields"][number];
export type CollectionFacetField = (typeof collection)["facetableFields"][number];
export type CollectionSortield = (typeof collection)["sortableFields"][number];

export interface CollectionDocument {
	id: string;
	title: string;
	authors: Array<string>;
	"publication-date": number;
	description: string;
	genres: Array<string>;
}
