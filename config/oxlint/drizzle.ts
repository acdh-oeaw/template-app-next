import { defineConfig } from "oxlint";

const config = defineConfig({
	jsPlugins: [{ name: "drizzle", specifier: "eslint-plugin-drizzle" }],
	rules: {
		"drizzle/enforce-delete-with-where": ["error", { drizzleObjectName: ["db", "tx"] }],
		"drizzle/enforce-update-with-where": ["error", { drizzleObjectName: ["db", "tx"] }],
	},
});

export default config;
