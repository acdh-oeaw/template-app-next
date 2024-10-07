import { log, times } from "@acdh-oeaw/lib";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/connect";

import { credentials } from "@/config/db.config";
import * as schema from "@/db/schema";

async function main() {
	const db = await drizzle("postgres-js", {
		casing: "snake_case",
		connection: { ...credentials, max: 1 },
		logger: true,
		schema,
	});

	for (const table of [schema.sessions, schema.users]) {
		// eslint-disable-next-line drizzle/enforce-delete-with-where
		await db.delete(table);
	}

	/** Users. */

	const users = times(10).map(() => {
		const user: schema.UserInput = {
			email: faker.internet.email(),
			passwordHash: faker.internet.password({ memorable: true }),
		};

		return user;
	});

	await db.insert(schema.users).values(users);

	// eslint-disable-next-line no-console
	console.table(users);

	await db.$client.end();
}

main()
	.then(() => {
		log.success("Successfully seeded database.");
	})
	.catch((error: unknown) => {
		log.error("Failed to seed database.\n", String(error));
		process.exitCode = 1;
	});
