import { Fira_Code, Noto_Sans } from "next/font/google";

/** Fallback font stacks are defined in `styles/index.css`. */

export const notoSans = Noto_Sans({
	style: ["normal", "italic"],
	/** Only controls preloading. Other subsets, e.g. `latin-ext`, are still loaded on demand via `unicode-range`. */
	subsets: ["latin"],
	variable: "--font-noto-sans",
});

export const firaCode = Fira_Code({
	/** The automatic fallback is always proportional (Arial), even for monospace fonts. */
	adjustFontFallback: false,
	/**
	 * Turbopack ignores `adjustFontFallback: false` unless `fallback` is set.
	 *
	 * @see {@link https://github.com/vercel/next.js/issues/74134}
	 */
	fallback: [],
	preload: false,
	variable: "--font-fira-code",
});
