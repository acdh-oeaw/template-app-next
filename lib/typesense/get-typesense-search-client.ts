import "server-only";

import { env } from "#/lib/env/server.ts";
import { createTypesenseSearchClient, type TypesenseSearchClient } from "#/lib/typesense/client.ts";

let client: TypesenseSearchClient | undefined;

/** Created on first use, so that pages don't read the variables at build time. */
export function getTypesenseSearchClient(): TypesenseSearchClient {
	client ??= createTypesenseSearchClient({ url: env.TYPESENSE_URL, apiKey: env.TYPESENSE_SEARCH_API_KEY });

	return client;
}
