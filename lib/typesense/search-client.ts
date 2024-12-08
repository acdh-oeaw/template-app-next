import { assert } from "@acdh-oeaw/lib";
import type { SearchClient as AlgoliaSearchClient } from "algoliasearch";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

import { env } from "@/config/env.config";
import { cacheSearchResultsForSeconds } from "@/config/typesense.config";

assert(
	env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY,
	"Missing NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY environment variable.",
);

export const typesense = new TypesenseInstantSearchAdapter({
	additionalSearchParameters: {
		query_by: "title,description",
	},
	server: {
		apiKey: env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY,
		cacheSearchResultsForSeconds,
		connectionTimeoutSeconds: 2,
		nodes: [
			{
				host: env.NEXT_PUBLIC_TYPESENSE_HOST,
				port: env.NEXT_PUBLIC_TYPESENSE_PORT,
				protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
			},
		],
	},
});

export const searchClient = typesense.searchClient as AlgoliaSearchClient;
