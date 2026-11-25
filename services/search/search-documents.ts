import { CollectionNotFoundError, type TypesenseClient } from "#/lib/typesense/client.ts";
import { documentSchema, type SearchDocument } from "#/services/search/collection.ts";

const perPage = 20;

interface SearchDocumentsInput {
	query: string;
	/** Starts at 1. */
	page: number;
}

interface SearchDocumentsDependencies {
	client: TypesenseClient;
	/** Alias of the collection. */
	collection: string;
}

export type SearchDocumentsResult =
	| { status: "found"; documents: Array<SearchDocument>; total: number; page: number; pageCount: number }
	/** The collection does not exist yet, like before the first `bun run search:index`. */
	| { status: "not-indexed" };

export async function searchDocuments(
	input: SearchDocumentsInput,
	dependencies: SearchDocumentsDependencies,
): Promise<SearchDocumentsResult> {
	const { client, collection } = dependencies;

	try {
		const response = await client.search(
			collection,
			{ q: input.query, queryBy: ["title", "body"], page: input.page, perPage },
			documentSchema,
		);

		return {
			status: "found",
			documents: response.hits.map((hit) => hit.document),
			total: response.found,
			page: response.page,
			pageCount: Math.ceil(response.found / perPage),
		};
	} catch (error) {
		if (error instanceof CollectionNotFoundError) {
			return { status: "not-indexed" };
		}

		throw error;
	}
}
