import "server-only";

import { env } from "#/lib/env/server.ts";
import { createTypesenseClient, type TypesenseClient } from "#/lib/typesense/client.ts";

let client: TypesenseClient | undefined;

/** Created on first use, so that pages don't read the variables at build time. */
export function getTypesenseClient(): TypesenseClient {
	client ??= createTypesenseClient({ url: env.TYPESENSE_URL, apiKey: env.TYPESENSE_ADMIN_API_KEY });

	return client;
}
