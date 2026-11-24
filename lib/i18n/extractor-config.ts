import type { unstable_extractMessages } from "next-intl/extractor";

import { defaultLocale, getLanguage, locales } from "#/lib/i18n/locales.ts";

type ExtractorConfigInput = Parameters<typeof unstable_extractMessages>[0];

/** Shared by the next-intl plugin in `next.config.ts` and eloqnt in `.eloqnt/config.ts`. */
export const extractorConfig = {
	messages: {
		format: "po",
		locales: Array.from(new Set(locales.map((locale) => getLanguage(locale)))),
		path: "./messages",
		sourceLocale: getLanguage(defaultLocale),
	},
	srcPath: ["./app", "./components", "./lib"],
} satisfies ExtractorConfigInput;
