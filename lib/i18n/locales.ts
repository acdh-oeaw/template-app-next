import { hasLocale, type Timezone } from "next-intl";

export const locales = ["de-AT", "en-GB"] as const;

export type IntlLocale = (typeof locales)[number];

export const defaultLocale: IntlLocale = "en-GB";

export function isValidLocale(value: unknown): value is IntlLocale {
	return hasLocale(locales, value);
}

export function createIntlLocale(locale: IntlLocale): Intl.Locale {
	return new Intl.Locale(locale);
}

export type IntlLanguage = IntlLocale extends `${infer Language}-${string}` ? Language : IntlLocale;

export function getIntlLanguage(locale: IntlLocale): IntlLanguage {
	return createIntlLocale(locale).language as IntlLanguage;
}

export const timeZone: Timezone = "UTC";
