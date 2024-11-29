import { join } from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { config as dotenv } from "dotenv";
import { expand } from "dotenv-expand";
import tsConfigPathsPlugin from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * Reading `.env` files here instead of using `dotenv-cli` so environment variables are
 * available to the vs code plugin as well.
 */
for (const envFilePath of [".env.test.local", ".env.local", ".env.test", ".env"]) {
	expand(dotenv({ path: join(process.cwd(), envFilePath) }));
}

// eslint-disable-next-line import-x/no-default-export
export default defineConfig({
	plugins: [tsConfigPathsPlugin()],
	test: {
		exclude: ["e2e", "node_modules"],
		projects: [
			{
				extends: true,
				plugins: [
					storybookTest({
						configDir: join(process.cwd(), "./config/storybook"),
					}),
				],
				test: {
					name: "storybook",
					browser: {
						enabled: true,
						headless: true,
						instances: [{ browser: "chromium" }],
						provider: "playwright",
					},
					setupFiles: [join(process.cwd(), "./config/storybook/vitest.setup.ts")],
				},
			},
		],
	},
});
