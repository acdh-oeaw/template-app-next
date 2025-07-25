import { Fira_Code, Inter } from "next/font/google";

export const body = Inter({
	axes: ["opsz"],
	display: "swap",
	style: ["normal", "italic"],
	subsets: ["latin", "latin-ext"],
	variable: "--_font-body",
});

export const heading = Inter({
	axes: ["opsz"],
	display: "swap",
	style: ["normal", "italic"],
	subsets: ["latin", "latin-ext"],
	variable: "--_font-heading",
});

export const code = Fira_Code({
	display: "swap",
	preload: false,
	subsets: ["latin", "latin-ext"],
	variable: "--_font-code",
});
