import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/config/env.config";
import * as schema from "@/db/schema";

declare global {
	// eslint-disable-next-line no-var
	var __db: postgres.Sql | undefined;
}

export const client =
	/** Avoid re-creating database connection on every HMR update. */
	globalThis.__db ??
	postgres({
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		host: env.DB_HOST,
		port: env.DB_PORT,
		database: env.DB_NAME,
	});

if (env.NODE_ENV !== "production") {
	globalThis.__db = client;
}

export const db = drizzle(client, { logger: process.env.NODE_ENV === "development", schema });

// function createSingleton<TValue>(name: string, getValue: () => TValue) {
// 	globalThis.__singletons ??= new Map()
// 	if (!globalThis.__singletons.has(name)) {
// 		globalThis.__singletons.set(name, getValue())
// 	}
// 	return globalThis.__singletons.get(name)
// }
