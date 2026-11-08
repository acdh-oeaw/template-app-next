import { defineConfig, devices } from "@playwright/test";
import * as v from "valibot";

const port = v.parse(
	v.optional(v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1), v.maxValue(65_535)), "3000"),
	process.env.PORT,
);
const baseURL = `http://localhost:${String(port)}`;

const isCI = process.env.CI === "true";

export default defineConfig({
	testDir: "../e2e",
	outputDir: "../test-results",
	snapshotPathTemplate: "{testDir}/snapshots/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}",

	fullyParallel: true,
	workers: isCI ? 1 : undefined,
	retries: isCI ? 2 : 0,
	forbidOnly: isCI,
	reporter: isCI ? [["github"], ["html", { open: "never", outputFolder: "../playwright-report" }]] : "list",

	webServer: {
		command: "bun run --sequential build start",
		cwd: "..",
		env: { BUILD_TARGET: "e2e", PORT: String(port) },
		url: baseURL,
		timeout: 3 * 60 * 1000,
		reuseExistingServer: !isCI,
	},

	use: {
		baseURL,
		trace: "on-first-retry",
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{
			name: "firefox",
			use: {
				...devices["Desktop Firefox"],
				launchOptions: {
					firefoxUserPrefs: {
						/**
						 * Prerendered pages are sent with `stale-while-revalidate`, so when another tab has cached a page, Firefox
						 * serves it from the cache and revalidates it in the background. Playwright reports the revalidation as a
						 * navigation that never finishes, and later actions hang waiting for it.
						 *
						 * @see {@link https://github.com/microsoft/playwright/issues/43995}
						 */
						"network.http.stale_while_revalidate.enabled": false,
					},
				},
			},
		},
		{ name: "webkit", use: { ...devices["Desktop Safari"] } },
	],
});
