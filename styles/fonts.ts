import { Fira_Code, Noto_Sans } from "next/font/google";

export const notoSans = Noto_Sans({
	style: ["normal", "italic"],
	/** Only controls preloading. Other subsets, e.g. `latin-ext`, are still loaded on demand via `unicode-range`. */
	subsets: ["latin"],
	variable: "--font-noto-sans",
});

export const firaCode = Fira_Code({
	preload: false,
	variable: "--font-fira-code",
});
