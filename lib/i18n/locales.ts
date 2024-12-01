import { unique } from "@acdh-oeaw/lib";
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

type GetLanguage<TLocale extends IntlLocale> = TLocale extends `${infer TLanguage}-${string}`
	? TLanguage
	: TLocale;

type GetLanguages<TLocales extends ReadonlyArray<IntlLocale>> = {
	[Index in keyof TLocales]: GetLanguage<TLocales[Index]>;
};

export type IntlLanguage = GetLanguage<IntlLocale>;

export function getIntlLanguage<TIntlLocale extends IntlLocale>(
	locale: TIntlLocale,
): GetLanguage<TIntlLocale> {
	return createIntlLocale(locale).language as GetLanguage<TIntlLocale>;
}

export const languages = unique(locales.map(getIntlLanguage)) as unknown as GetLanguages<
	typeof locales
>;

export const timeZone: Timezone = "UTC";
