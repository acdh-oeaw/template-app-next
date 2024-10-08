import { log } from "@acdh-oeaw/lib";
import { drizzle, migrate } from "drizzle-orm/connect";

import { credentials } from "../config/db.config.js";
import config from "../config/drizzle.config.js";

async function main() {
	const db = await drizzle("postgres-js", {
		casing: "snake_case",
		connection: { ...credentials, max: 1 },
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
