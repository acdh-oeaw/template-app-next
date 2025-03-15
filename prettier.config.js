/** @typedef {import("prettier").Config} Config */

import preset from "@acdh-oeaw/prettier-config";
import * as tailwindcssPlugin from "prettier-plugin-tailwindcss";

/** @type {Config} */
const config = {
	...preset,
	plugins: [...(preset.plugins ?? []), tailwindcssPlugin],
	tailwindFunctions: ["cn", "styles"],
	tailwindStylesheet: "./styles/index.css",
};

export default config;
