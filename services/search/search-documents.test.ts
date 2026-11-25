import { describe, expect, test } from "bun:test";

import { CollectionNotFoundError, type TypesenseClient } from "#/lib/typesense/client.ts";
import { searchDocuments } from "#/services/search/search-documents.ts";

const collection = "test";

function createFakeClient(search: TypesenseClient["search"]): TypesenseClient {
	return {
		createCollection: () => Promise.resolve(),
		deleteCollection: () => Promise.resolve(),
		listCollections: () => Promise.resolve([]),
		importDocuments: () => Promise.resolve(),
		setAlias: () => Promise.resolve(),
		search,
	};
}

describe("searchDocuments", () => {
	test("returns the documents of the page, and the number of pages", async () => {
		const document = { id: "1", title: "Vienna", body: "A city." };
		const client = createFakeClient(() => Promise.resolve({ found: 41, page: 2, hits: [{ document }] }));

		const result = await searchDocuments({ query: "vienna", page: 2 }, { client, collection });

		expect(result).toStrictEqual({ status: "found", documents: [document], total: 41, page: 2, pageCount: 3 });
	});

	test("reports a missing collection as not indexed", async () => {
		const error = new CollectionNotFoundError(collection, { cause: null });
		const client = createFakeClient(() => Promise.reject(error));

		const result = await searchDocuments({ query: "vienna", page: 1 }, { client, collection });

		expect(result).toStrictEqual({ status: "not-indexed" });
	});

	test("throws other errors", async () => {
		const error = new Error("Connection refused");
		const client = createFakeClient(() => Promise.reject(error));

		const reason: unknown = await searchDocuments({ query: "vienna", page: 1 }, { client, collection }).catch(
			(error: unknown) => error,
		);

		expect(reason).toBe(error);
	});
});
