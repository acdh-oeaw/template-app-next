import { assert, log } from "@acdh-oeaw/lib";
import { Client, Errors } from "typesense";

import { env } from "@/config/env.config";
import { collection } from "@/lib/typesense/collection";

async function create() {
	const apiKey = env.TYPESENSE_ADMIN_API_KEY;
	assert(apiKey, "Missing `TYPESENSE_ADMIN_API_KEY` environment variable.");

	const client = new Client({
		apiKey,
		connectionTimeoutSeconds: 3,
		nodes: [
			{
				host: env.NEXT_PUBLIC_TYPESENSE_HOST,
				port: env.NEXT_PUBLIC_TYPESENSE_PORT,
				protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
			},
		],
	});

	try {
		await client.collections(collection.name).delete();
	} catch (error) {
		if (!(error instanceof Errors.ObjectNotFound)) {
			throw error;
		}
	}

	await client.collections().create(collection.schema);
}

create()
	.then(() => {
		log.success(`Successfully created collection "${collection.name}".`);
	})
	.catch((error: unknown) => {
		log.error(`Failed to create collection "${collection.name}".\n`, String(error));
		process.exitCode = 1;
	});
