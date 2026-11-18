import { fromRoot } from "#/configs/paths.ts";

const config = {
	endOfLine: "lf",
	jsdoc: true,
	printWidth: 120,
	sortImports: {
		groups: [
			"side_effect",
			"side_effect_style",
			"builtin",
			"external",
			["internal", "subpath"],
			["parent", "sibling", "index"],
			"style",
			"unknown",
		],
		internalPattern: ["#"],
		newlinesBetween: true,
	},
	sortPackageJson: { sortScripts: true },
	sortTailwindcss: { functions: ["clsx"], stylesheet: fromRoot("styles/index.css") },
	tabWidth: 2,
	useTabs: true,
};

export default config;
