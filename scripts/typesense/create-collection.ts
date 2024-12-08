import { log } from "@acdh-oeaw/lib";
import { Client, Errors } from "typesense";

import { env } from "@/config/env.config";
import { schema } from "@/lib/typesense/schema";

async function generate() {
	const client = new Client({
		apiKey: env.TYPESENSE_API_KEY,
		nodes: [
			{
				host: env.NEXT_PUBLIC_TYPESENSE_HOST,
				port: env.NEXT_PUBLIC_TYPESENSE_PORT,
				protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
			},
		],
	});

	try {
		await client.collections(schema.name).delete();
	} catch (error) {
		if (!(error instanceof Errors.ObjectNotFound)) {
			throw error;
		}
	}

	await client.collections().create(schema);

	const searchApiKey = await client.keys().create({
		description: "Search-only API key.",
		actions: ["documents:search", "documents:get"],
		collections: [schema.name],
	});

	log.info(`Search-only API key: "${String(searchApiKey.value)}".`);
}

generate()
	.then(() => {
		log.success(`Successfully created collection "${schema.name}".`);
	})
	.catch((error: unknown) => {
		log.error(`Failed to create collection "${schema.name}".\n`, String(error));
		process.exitCode = 1;
	});
