import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { credentials } from "@/config/db.config";
import { env } from "@/config/env.config";
import * as schema from "@/db/schema";

declare global {
	// eslint-disable-next-line no-var
	var __db: postgres.Sql | undefined;
}

/** Avoid re-creating database connection on every HMR update. */
export const client = globalThis.__db ?? postgres(credentials);

if (env.NODE_ENV !== "production") {
	globalThis.__db = client;
}

export const db = drizzle(client, {
	casing: "snake_case",
	logger: process.env.NODE_ENV === "development",
	schema,
});

// function createSingleton<TValue>(name: string, getValue: () => TValue) {
// 	globalThis.__singletons ??= new Map()
// 	if (!globalThis.__singletons.has(name)) {
// 		globalThis.__singletons.set(name, getValue())
// 	}
// 	return globalThis.__singletons.get(name)
// }
