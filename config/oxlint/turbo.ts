import { defineConfig } from "oxlint";

const config = defineConfig({
	jsPlugins: [{ name: "turbo", specifier: "eslint-plugin-turbo" }],
	rules: {
		"turbo/no-undeclared-env-vars": "error",
	},
});

export default config;
