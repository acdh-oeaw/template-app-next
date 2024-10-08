import { defineConfig } from "drizzle-kit";

import { credentials } from "./db.config.js";

export default defineConfig({
	casing: "snake_case",
	dbCredentials: credentials,
	dialect: "postgresql",
	out: "./db/migrations/",
	schema: "./db/schema.ts",
	strict: true,
	verbose: true,
});
