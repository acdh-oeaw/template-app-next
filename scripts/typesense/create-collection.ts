import { log } from "@acdh-oeaw/lib";
import { Client, Errors } from "typesense";

import { env } from "@/config/env.config";
import { schema } from "@/lib/typesense/schema";

const collection = schema.name;

async function generate() {
	const client = new Client({
		apiKey: env.TYPESENSE_ADMIN_API_KEY,
		nodes: [
			{
				host: env.NEXT_PUBLIC_TYPESENSE_HOST,
				port: env.NEXT_PUBLIC_TYPESENSE_PORT,
				protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
			},
		],
	});

	try {
		await client.collections(collection).delete();
	} catch (error) {
		if (!(error instanceof Errors.ObjectNotFound)) {
			throw error;
		}
	}

	await client.collections().create(schema);
}

generate()
	.then(() => {
		log.success(`Successfully created collection "${collection}".`);
	})
	.catch((error: unknown) => {
		log.error(`Failed to create collection "${collection}".\n`, String(error));
		process.exitCode = 1;
	});
