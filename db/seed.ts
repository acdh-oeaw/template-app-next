import { log } from "@acdh-oeaw/lib";
// import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import { reset, seed } from "drizzle-seed";
import postgres from "postgres";

import { credentials } from "@/config/db.config";
import * as schema from "@/db/schema";
import { encryptString } from "@/lib/server/auth/encryption";
import { generateRandomRecoveryCode } from "@/lib/server/auth/utils";

const client = postgres({ ...credentials, max: 1 });

const db = drizzle(client, {
	casing: "snake_case",
	logger: true,
	schema,
});

async function main() {
	await reset(db, schema);

	await seed(db, schema).refine((_f) => {
		return {
			usersTable: {
				columns: {
					recoveryCode() {
						return Buffer.from(encryptString(generateRandomRecoveryCode()));
					},
				},
			},
		};
	});
}

main()
	.then(() => {
		log.success("Successfully seeded database.");
	})
	.catch((error: unknown) => {
		log.error("Failed to seed database.\n", String(error));
		process.exitCode = 1;
	})
	.finally(() => {
		db.$client.end().catch((error: unknown) => {
			log.error(String(error));
			process.exitCode = 1;
		});
	});
