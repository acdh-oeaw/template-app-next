import { log } from "@acdh-oeaw/lib";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

async function main() {
	const client = new PGlite();
	const db = drizzle(client);

	await migrate(db, { migrationsFolder: "./db/migrations" });
}

main()
	.then(() => {
		log.success("Successfully applied database migrations.");
	})
	// eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
	.catch((error) => {
		log.error("Failed to apply database migrations.\n", String(error));
		// eslint-disable-next-line no-undef
		process.exitCode = 1;
	});
