import tsConfigPathsPlugin from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import { join } from "node:path";

import { config as dotenv } from "dotenv";
import { expand } from "dotenv-expand";

/**
 * Reading `.env` files here instead of using `dotenv-cli` so environment variables are
 * available to the vs code plugin as well.
 */
for (const envFilePath of [".env.test.local", ".env.local", ".env.test", ".env"]) {
	expand(dotenv({ path: join(process.cwd(), envFilePath) }));
}

export default defineConfig({
	plugins: [tsConfigPathsPlugin()],
	test: {
		include: ["./test/**/*.test.ts"],
	},
});
