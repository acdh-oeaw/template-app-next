import { log } from "@acdh-oeaw/lib";
import { migrate } from "drizzle-orm/pglite/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { credentials } from "@/config/db.config";
import config from "@/config/drizzle.config";

async function main() {
	const client = postgres({ ...credentials, max: 1 });

	const db = drizzle(client);

	await migrate(db, { migrationsFolder: config.out! });

	await client.end();
}

main()
	.then(() => {
		log.success("Successfully applied database migrations.");
	})
	.catch((error: unknown) => {
		log.error("Failed to apply database migrations.\n", String(error));
		process.exitCode = 1;
	});
