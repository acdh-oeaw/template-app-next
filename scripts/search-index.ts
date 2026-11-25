import { createServerEnv } from "#/lib/env/parse.ts";
import { createTypesenseClient } from "#/lib/typesense/client.ts";
import type { SearchDocument } from "#/services/search/collection.ts";
import { indexDocuments } from "#/services/search/index-documents.ts";

/** Sample documents. Replace them with the app's data, like records from a database or a cms. */
const documents: Array<SearchDocument> = [
	{ id: "1", title: "Vienna", body: "The capital of Austria, on the Danube." },
	{ id: "2", title: "Graz", body: "The second largest city of Austria, in Styria." },
	{ id: "3", title: "Innsbruck", body: "A city in the Alps, the capital of Tyrol." },
];

/** `lib/env/server.ts` imports `server-only`, which throws outside of Next.js. */
const env = createServerEnv();

if (env.TYPESENSE_INDEX_API_KEY == null) {
	throw new Error("Missing `TYPESENSE_INDEX_API_KEY`.");
}

await indexDocuments(documents, {
	client: createTypesenseClient({ url: env.TYPESENSE_URL, apiKey: env.TYPESENSE_INDEX_API_KEY }),
	collection: env.TYPESENSE_COLLECTION,
	now: Date.now(),
});

console.log(`Indexed ${String(documents.length)} documents.`);
