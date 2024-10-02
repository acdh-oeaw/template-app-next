import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	out: "./drizzle",
	schema: "./lib/db/schema.ts",
	strict: true,
	verbose: true,
});
