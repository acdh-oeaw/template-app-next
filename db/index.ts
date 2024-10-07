import "server-only";

import { drizzle } from "drizzle-orm/connect";

import { credentials } from "@/config/db.config";
import { env } from "@/config/env.config";
import * as schema from "@/db/schema";

declare global {
	// eslint-disable-next-line no-var
	var __db: Awaited<ReturnType<typeof createDatabaseClient>> | undefined;
}

function createDatabaseClient() {
	return drizzle("postgres-js", {
		casing: "snake_case",
		connection: credentials,
		logger: process.env.NODE_ENV === "development",
		schema,
	});
}

export const db = globalThis.__db ?? (await createDatabaseClient());

/** Avoid re-creating database client on every HMR update. */
if (env.NODE_ENV !== "production") {
	globalThis.__db = db;
}
