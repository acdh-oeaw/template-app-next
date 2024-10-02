import sqlite from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "@/lib/db/schema";

const sqliteDB = sqlite(":memory:");

export const db = drizzle(sqliteDB, { schema });
