import * as v from "valibot";

import { generate } from "#/lib/env/generate.ts";
import packageJson from "#/package.json";

export const typesenseEnvEntries = {
	TYPESENSE_ADMIN_API_KEY: v.pipe(
		v.string(),
		v.nonEmpty(),
		v.description("Admin api key of the Typesense server, also used by `docker/compose.yaml`."),
		v.metadata({ dev: generate.hex(32) }),
	),
	TYPESENSE_COLLECTION: v.optional(
		v.pipe(
			v.string(),
			v.nonEmpty(),
			v.description("Name of the collection, unique on a Typesense server that several apps or environments share."),
		),
		packageJson.name.split("/").at(-1)!,
	),
	TYPESENSE_URL: v.pipe(
		v.string(),
		v.url(),
		v.description("Base url of the Typesense server."),
		v.metadata({ dev: "http://localhost:8108" }),
	),
} satisfies v.ObjectEntries;
