import * as v from "valibot";

import type { CollectionSchema } from "#/lib/typesense/client.ts";

export const collectionFields = [
	{ name: "title", type: "string" },
	{ name: "body", type: "string" },
] satisfies CollectionSchema["fields"];

export const documentSchema = v.object({
	id: v.string(),
	title: v.string(),
	body: v.string(),
});

export type SearchDocument = v.InferOutput<typeof documentSchema>;
