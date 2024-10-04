import { log } from "@acdh-oeaw/lib";
import { migrate } from "drizzle-orm/pglite/migrator";

import config from "@/config/drizzle.config";
import { db } from "@/db";

async function main() {
	await migrate(db, { migrationsFolder: config.out! });
}

main()
	.then(() => {
		log.success("Successfully applied database migrations.");
	})
	.catch((error: unknown) => {
		log.error("Failed to apply database migrations.\n", String(error));
		process.exitCode = 1;
	});
