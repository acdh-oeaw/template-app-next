import type { TypesenseClient } from "#/lib/typesense/client.ts";
import { collection, type SearchDocument } from "#/services/search/collection.ts";

interface IndexDocumentsDependencies {
	client: TypesenseClient;
}

export async function indexDocuments(
	documents: ReadonlyArray<SearchDocument>,
	dependencies: IndexDocumentsDependencies,
): Promise<void> {
	const { client } = dependencies;

	await client.ensureCollection(collection);
	await client.upsertDocuments(collection.name, documents);
}
