import * as v from "valibot";

import { generate } from "#/lib/env/generate.ts";
import packageJson from "#/package.json";

let devKey: string | undefined;

function getDevKey(): string {
	devKey ??= generate.hex(32)();

	return devKey;
}

export const typesenseEnvEntries = {
	TYPESENSE_COLLECTION: v.optional(
		v.pipe(
			v.string(),
			v.nonEmpty(),
			v.description(
				"Alias of the collection, unique on a Typesense server that several apps or environments share. Collections are named like the alias, with a timestamp.",
			),
		),
		packageJson.name.split("/").at(-1)!,
	),
	TYPESENSE_INDEX_API_KEY: v.optional(
		v.pipe(
			v.string(),
			v.nonEmpty(),
			v.description(
				"Api key to index documents, only for `bun run search:index`. Local development uses it as the admin key of the server in `docker/compose.yaml`.",
			),
			v.metadata({ dev: getDevKey, phases: [] }),
		),
	),
	TYPESENSE_SEARCH_API_KEY: v.pipe(
		v.string(),
		v.nonEmpty(),
		v.description("Api key to search documents. Local development uses the same key as for indexing."),
		v.metadata({ dev: getDevKey }),
	),
	TYPESENSE_URL: v.pipe(
		v.string(),
		v.url(),
		v.description("Base url of the Typesense server."),
		v.metadata({ dev: "http://localhost:8108" }),
	),
} satisfies v.ObjectEntries;
