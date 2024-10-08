import { log } from "@acdh-oeaw/lib";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { credentials } from "@/config/db.config";
import * as schema from "@/db/schema";

async function main() {
	const client = postgres({ ...credentials, max: 1 });

	const db = drizzle(client, {
		casing: "snake_case",
		logger: true,
	});

	for (const table of [schema.sessions, schema.users]) {
		// eslint-disable-next-line drizzle/enforce-delete-with-where
		await db.delete(table);
	}

	await db.$client.end();
}

main()
	.then(() => {
		log.success("Successfully cleared database.");
	})
	.catch((error: unknown) => {
		log.error("Failed to clear database.\n", String(error));
		process.exitCode = 1;
	});
