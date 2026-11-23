import type { unstable_extractMessages } from "next-intl/extractor";

type ExtractorConfigInput = Parameters<typeof unstable_extractMessages>[0];

export const locales = ["en-GB", "de-AT"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-GB";

/** Shows calendar dates as stored. Pass an explicit `timeZone` for points in time, e.g. event start times. */
export const timeZone = "UTC";

export function getLanguage(locale: Locale): string {
	return new Intl.Locale(locale).language;
}

/** Shared by the next-intl plugin in `next.config.ts` and `bun run i18n:extract`. */
export const extractorConfig = {
	extract: true,
	messages: {
		format: "po",
		locales: Array.from(new Set(locales.map((locale) => getLanguage(locale)))),
		path: "./messages",
		sourceLocale: getLanguage(defaultLocale),
	},
	srcPath: ["./app", "./components", "./lib"],
} satisfies ExtractorConfigInput;
