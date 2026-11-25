import type { TypesenseClient } from "#/lib/typesense/client.ts";
import { collectionFields, type SearchDocument } from "#/services/search/collection.ts";

interface IndexDocumentsDependencies {
	client: TypesenseClient;
	/** Name of the collection. */
	collection: string;
}

export async function indexDocuments(
	documents: ReadonlyArray<SearchDocument>,
	dependencies: IndexDocumentsDependencies,
): Promise<void> {
	const { client, collection } = dependencies;

	await client.ensureCollection({ name: collection, fields: collectionFields });
	await client.upsertDocuments(collection, documents);
}
