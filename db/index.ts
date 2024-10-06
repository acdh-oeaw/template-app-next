import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/config/env.config";
import * as schema from "@/db/schema";

/** Avoid re-creating database connection on every HMR update. */
const _global = globalThis as unknown as {
	_pg: postgres.Sql | undefined;
};

export const client =
	_global._pg ??
	postgres({
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		host: env.DB_HOST,
		port: env.DB_PORT,
		database: env.DB_NAME,
	});

if (env.NODE_ENV !== "production") {
	_global._pg = client;
}

export const db = drizzle(client, { logger: process.env.NODE_ENV === "development", schema });
