import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { defineConfig } from "vitest/config";

const dirname =
	typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// eslint-disable-next-line import-x/no-default-export
export default defineConfig({
	test: {
		workspace: [
			{
				extends: true,
				plugins: [storybookTest({ configDir: path.join(dirname, "./config/storybook") })],
				test: {
					name: "storybook",
					browser: {
						enabled: true,
						headless: true,
						provider: "playwright",
						instances: [{ browser: "chromium" }],
					},
					setupFiles: ["./config/storybook/vitest.setup.ts"],
				},
			},
		],
	},
});
