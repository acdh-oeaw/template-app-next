import * as v from "valibot";

import { HttpError } from "#/lib/request/errors.ts";
import { request } from "#/lib/request/request.ts";

export interface CollectionField {
	name: string;
	type: "bool" | "float" | "int32" | "int64" | "string" | "string[]";
	facet?: boolean;
	optional?: boolean;
}

export interface CollectionSchema {
	name: string;
	fields: ReadonlyArray<CollectionField>;
}

export interface SearchParams {
	q: string;
	queryBy: ReadonlyArray<string>;
	page: number;
	perPage: number;
}

export interface SearchResponse<TDocument> {
	found: number;
	page: number;
	hits: Array<{ document: TDocument }>;
}

/**
 * Each interface needs the permissions of one api key, so that a client cannot call what its key is not allowed to.
 * Services depend on them rather than on `request()`, so that tests can pass a fake.
 */
export interface TypesenseSearchClient {
	/** Throws a `CollectionNotFoundError` when neither an alias nor a collection with the name exists. */
	search: <TSchema extends v.GenericSchema>(
		collection: string,
		params: SearchParams,
		documentSchema: TSchema,
	) => Promise<SearchResponse<v.InferOutput<TSchema>>>;
}

export interface TypesenseIndexClient {
	createCollection: (schema: CollectionSchema) => Promise<void>;
	deleteCollection: (name: string) => Promise<void>;
	/** Names of the collections that the api key has access to. */
	listCollections: () => Promise<Array<string>>;
	importDocuments: (collection: string, documents: ReadonlyArray<{ id: string }>) => Promise<void>;
	/** Creates the alias, or switches it to another collection. */
	setAlias: (alias: string, collection: string) => Promise<void>;
}

interface ClientOptions {
	url: string;
	apiKey: string;
}

export class CollectionNotFoundError extends Error {
	override readonly name = "CollectionNotFoundError";

	constructor(collection: string, options: { cause: unknown }) {
		super(`The collection "${collection}" does not exist`, options);
	}
}

export class TypesenseImportError extends Error {
	override readonly name = "TypesenseImportError";
}

const importResultSchema = v.object({ success: v.boolean(), error: v.optional(v.string()) });

/** Typesense also responds with 404 when a field does not exist, which is a bug. */
function isCollectionNotFound(error: unknown): boolean {
	return error instanceof HttpError && error.status === 404 && error.body.includes("Collection not found");
}

/** The api key goes in a header, so that it does not end up in logs and error messages with the url. */
function createHeaders(apiKey: string): Record<string, string> {
	return { "x-typesense-api-key": apiKey };
}

/** @see {@link https://typesense.org/docs/latest/api/} */
export function createTypesenseIndexClient(options: ClientOptions): TypesenseIndexClient {
	const { url, apiKey } = options;

	const headers = createHeaders(apiKey);

	return {
		async createCollection(schema) {
			await request(new URL("/collections", url), { method: "post", headers, json: schema, responseType: "void" });
		},

		async deleteCollection(name) {
			await request(new URL(`/collections/${encodeURIComponent(name)}`, url), {
				method: "delete",
				headers,
				responseType: "void",
			});
		},

		async listCollections() {
			const endpoint = new URL("/collections", url);
			endpoint.searchParams.set("exclude_fields", "fields");

			const { data } = await request(endpoint, {
				headers,
				responseType: "json",
				schema: v.array(v.object({ name: v.string() })),
			});

			return data.map(({ name }) => name);
		},

		async setAlias(alias, collection) {
			await request(new URL(`/aliases/${encodeURIComponent(alias)}`, url), {
				method: "put",
				headers,
				json: { collection_name: collection },
				responseType: "void",
			});
		},

		async importDocuments(collection, documents) {
			const endpoint = new URL(`/collections/${encodeURIComponent(collection)}/documents/import`, url);
			endpoint.searchParams.set("action", "create");

			const { data } = await request(endpoint, {
				method: "post",
				headers: { ...headers, "content-type": "text/plain" },
				body: documents.map((document) => JSON.stringify(document)).join("\n"),
				responseType: "text",
				timeout: 60_000,
			});

			/** Responds with 200 and one result per line, also when documents fail. */
			const failures = data
				.split("\n")
				.filter((line) => line !== "")
				.map((line) => v.parse(importResultSchema, JSON.parse(line)))
				.filter((result) => !result.success);

			if (failures.length > 0) {
				throw new TypesenseImportError(
					`${String(failures.length)} documents failed to import into "${collection}": ${failures[0]?.error ?? ""}`,
				);
			}
		},
	};
}

/** @see {@link https://typesense.org/docs/latest/api/} */
export function createTypesenseSearchClient(options: ClientOptions): TypesenseSearchClient {
	const { url, apiKey } = options;

	const headers = createHeaders(apiKey);

	return {
		async search(collection, params, documentSchema) {
			const endpoint = new URL(`/collections/${encodeURIComponent(collection)}/documents/search`, url);
			endpoint.searchParams.set("q", params.q);
			endpoint.searchParams.set("query_by", params.queryBy.join(","));
			endpoint.searchParams.set("page", String(params.page));
			endpoint.searchParams.set("per_page", String(params.perPage));

			const { data } = await request(endpoint, {
				headers,
				responseType: "json",
				retries: 2,
				schema: v.object({
					found: v.number(),
					page: v.number(),
					hits: v.array(v.object({ document: documentSchema })),
				}),
			}).catch((error: unknown) => {
				if (isCollectionNotFound(error)) {
					throw new CollectionNotFoundError(collection, { cause: error });
				}

				throw error;
			});

			/** The schema validates the documents, but TypeScript cannot infer its output for a generic `TSchema`. */
			return data as SearchResponse<v.InferOutput<typeof documentSchema>>;
		},
	};
}
