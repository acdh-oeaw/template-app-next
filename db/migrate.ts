import { log } from "@acdh-oeaw/lib";
import { drizzle, migrate } from "drizzle-orm/connect";

import { credentials } from "@/config/db.config";
import config from "@/config/drizzle.config";

async function main() {
	const db = await drizzle("postgres-js", {
		casing: "snake_case",
		connection: { ...credentials, max: 1 },
		logger: true,
	});

	await migrate(db, { migrationsFolder: config.out! });

	await db.$client.end();
}

main()
	.then(() => {
		log.success("Successfully applied database migrations.");
	})
	.catch((error: unknown) => {
		log.error("Failed to apply database migrations.\n", String(error));
		process.exitCode = 1;
	});
