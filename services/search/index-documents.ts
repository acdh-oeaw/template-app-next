import type { TypesenseIndexClient } from "#/lib/typesense/client.ts";
import { collectionFields, type SearchDocument } from "#/services/search/collection.ts";

interface IndexDocumentsDependencies {
	client: TypesenseIndexClient;
	/** Alias of the collection. */
	collection: string;
	/** Timestamp in milliseconds. */
	now: number;
}

/**
 * Indexes the documents in a new collection, switches the alias to it, and deletes previous collections, so that search
 * keeps working with the previous documents until all new ones are indexed. Runs must not overlap, because Typesense
 * accepts an alias of a collection that another run has deleted.
 */
export async function indexDocuments(
	documents: ReadonlyArray<SearchDocument>,
	dependencies: IndexDocumentsDependencies,
): Promise<void> {
	const { client, collection: alias, now } = dependencies;

	const collection = `${alias}_${String(now)}`;
	const existing = await client.listCollections();

	if (existing.includes(alias)) {
		throw new Error(`The collection "${alias}" hides the alias with the same name, so it must be deleted first.`);
	}

	await client.createCollection({ name: collection, fields: collectionFields });

	try {
		await client.importDocuments(collection, documents);
	} catch (error) {
		/** When this fails as well, the next run deletes the collection. */
		await client.deleteCollection(collection).catch(() => undefined);

		throw error;
	}

	/** When this fails, the alias may still have been switched, so the new collection must not be deleted. */
	await client.setAlias(alias, collection);

	const names = await client.listCollections();
	const previous = names.filter((name) => {
		const timestamp = getTimestamp(name, alias);

		return timestamp != null && timestamp < now;
	});

	await Promise.all(previous.map((name) => client.deleteCollection(name)));
}

function getTimestamp(collection: string, alias: string): number | null {
	const prefix = `${alias}_`;
	const suffix = collection.slice(prefix.length);

	return collection.startsWith(prefix) && /^\d+$/.test(suffix) ? Number(suffix) : null;
}
