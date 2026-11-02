export const locales = ["en-GB"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-GB";

/** Shows calendar dates as stored. Pass an explicit `timeZone` for points in time, e.g. event start times. */
export const timeZone = "UTC";

export function getLanguage(locale: Locale): string {
	return new Intl.Locale(locale).language;
}
