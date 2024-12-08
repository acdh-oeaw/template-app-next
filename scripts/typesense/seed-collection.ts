import { log, times } from "@acdh-oeaw/lib";
import { faker } from "@faker-js/faker";
import { Client } from "typesense";

import { env } from "@/config/env.config";
import { schema } from "@/lib/typesense/schema";

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

	const documents = times(1000).map(() => {
		return {
			id: faker.string.uuid(),
			title: faker.commerce.productName(),
			description: faker.commerce.productDescription(),
			categories: times(faker.number.int({ min: 1, max: 3 })).map(() => {
				return faker.commerce.department();
			}),
			brand: faker.company.name(),
		};
	});

	await client.collections(schema.name).documents().import(documents);
}

generate()
	.then(() => {
		log.success(`Successfully seeded collection "${schema.name}".`);
	})
	.catch((error: unknown) => {
		log.error(`Failed to seed collection "${schema.name}".\n`, String(error));
		process.exitCode = 1;
	});
