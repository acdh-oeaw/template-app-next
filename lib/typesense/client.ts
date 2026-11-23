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

/** Services depend on this interface rather than on `request()`, so that tests can pass a fake. */
export interface TypesenseClient {
	/** Creates the collection, unless it exists. */
	ensureCollection: (schema: CollectionSchema) => Promise<void>;
	/** Creates or replaces documents by their `id`. */
	upsertDocuments: (collection: string, documents: ReadonlyArray<{ id: string }>) => Promise<void>;
	/** Throws an `HttpError` with status 404 when the collection does not exist. */
	search: <TSchema extends v.GenericSchema>(
		collection: string,
		params: SearchParams,
		documentSchema: TSchema,
	) => Promise<SearchResponse<v.InferOutput<TSchema>>>;
}

export class TypesenseImportError extends Error {
	override readonly name = "TypesenseImportError";
}

const importResultSchema = v.object({ success: v.boolean(), error: v.optional(v.string()) });

/** @see {@link https://typesense.org/docs/latest/api/} */
export function createTypesenseClient(options: { url: string; apiKey: string }): TypesenseClient {
	const { url, apiKey } = options;

	/** The api key goes in a header, so that it does not end up in logs and error messages with the url. */
	const headers = { "x-typesense-api-key": apiKey };

	return {
		async ensureCollection(schema) {
			try {
				await request(new URL("/collections", url), {
					method: "post",
					headers,
					json: schema,
					responseType: "void",
				});
			} catch (error) {
				if (error instanceof HttpError && error.status === 409) {
					return;
				}

				throw error;
			}
		},

		async upsertDocuments(collection, documents) {
			const endpoint = new URL(`/collections/${encodeURIComponent(collection)}/documents/import`, url);
			endpoint.searchParams.set("action", "upsert");

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
			});

			/** The schema validates the documents, but TypeScript cannot infer its output for a generic `TSchema`. */
			return data as SearchResponse<v.InferOutput<typeof documentSchema>>;
		},
	};
}
