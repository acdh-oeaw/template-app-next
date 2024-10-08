import { log } from "@acdh-oeaw/lib";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { credentials } from "../config/db.config.js";
import config from "../config/drizzle.config.js";

async function main() {
	const client = postgres({ ...credentials, max: 1 });

	const db = drizzle(client, {
		casing: "snake_case",
		logger: true,
	});

	await migrate(db, { migrationsFolder: /** @type {string} */ (config.out) });

	await db.$client.end();
}

main()
	.then(() => {
		log.success("Successfully applied database migrations.");
	})
	.catch((/** @type {unknown} */ error) => {
		log.error("Failed to apply database migrations.\n", String(error));
		// eslint-disable-next-line no-undef
		process.exitCode = 1;
	});
