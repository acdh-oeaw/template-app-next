import { log, times } from "@acdh-oeaw/lib";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { credentials } from "@/config/db.config";
import * as schema from "@/db/schema";

async function main() {
	const client = postgres({ ...credentials, max: 1 });

	const db = drizzle(client, { schema });

	for (const table of [schema.sessions, schema.users]) {
		// eslint-disable-next-line drizzle/enforce-delete-with-where
		await db.delete(table);
	}

	/** Users. */

	const users = times(10).map(() => {
		const user: schema.UserInput = {
			username: faker.internet.userName(),
			passwordHash: faker.internet.password({ memorable: true }),
		};

		return user;
	});

	await db.insert(schema.users).values(users);

	// eslint-disable-next-line no-console
	console.table(users);

	await client.end();
}

main()
	.then(() => {
		log.success("Successfully seeded database.");
	})
	.catch((error: unknown) => {
		log.error("Failed to seed database.\n", String(error));
		process.exitCode = 1;
	});
