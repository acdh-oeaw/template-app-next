import { defineConfig, devices } from "@playwright/test";

const port = 3000;
const baseURL = `http://localhost:${String(port)}`;

const isCI = process.env.CI === "true";

export default defineConfig({
	testDir: "../e2e",
	outputDir: "../test-results",
	snapshotPathTemplate: "{testDir}/snapshots/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}",
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	workers: isCI ? 1 : undefined,
	reporter: isCI ? [["github"], ["html", { open: "never", outputFolder: "../playwright-report" }]] : "list",
	use: {
		baseURL,
		trace: "on-first-retry",
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{ name: "firefox", use: { ...devices["Desktop Firefox"] } },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } },
	],
	webServer: {
		command: "bun run build && bun run start",
		url: baseURL,
		reuseExistingServer: !isCI,
		timeout: 3 * 60 * 1000,
		env: { PORT: String(port) },
	},
});
