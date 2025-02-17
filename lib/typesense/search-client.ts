import { assert } from "@acdh-oeaw/lib";
import { cache } from "react";
import { Client } from "typesense";

import { env } from "@/config/env.config";
import { cacheSearchResultsForSeconds } from "@/config/typesense.config";

export const createClient = cache(function createClient(): Client {
	const apiKey = env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY;
	assert(apiKey, "Missing `NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY` environment variable.");

	const client = new Client({
		apiKey,
		cacheSearchResultsForSeconds,
		connectionTimeoutSeconds: 3,
		nodes: [
			{
				host: env.NEXT_PUBLIC_TYPESENSE_HOST,
				port: env.NEXT_PUBLIC_TYPESENSE_PORT,
				protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
			},
		],
	});

	return client;
});
