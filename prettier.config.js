/** @typedef {import("prettier").Config} Config */

import shared from "@acdh-oeaw/prettier-config";

/** @type {Config} */
const config = {
	...shared,
	plugins: [...(shared.plugins ?? []), "prettier-plugin-tailwindcss"],
	tailwindFunctions: ["cn", "styles"],
	tailwindStylesheet: "./styles/index.css",
};

export default config;
