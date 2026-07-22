import { unique } from "@acdh-oeaw/lib";
import { type Timezone, hasLocale } from "next-intl";

export const locales = ["en-GB"] as const;

export type IntlLocale = (typeof locales)[number];

export const defaultLocale: IntlLocale = "en-GB";

export const timeZone: Timezone = "UTC";

export function isValidLocale(value: unknown): value is IntlLocale {
	return hasLocale(locales, value);
}

export function createIntlLocale(locale: IntlLocale): Intl.Locale {
	return new Intl.Locale(locale);
}

type GetIntlLanguage<TIntlLocale extends IntlLocale> = TIntlLocale extends `${infer TIntlLanguage}-${string}`
	? TIntlLanguage
	: TIntlLocale;

type GetIntlLanguages<TIntlLocales extends ReadonlyArray<IntlLocale>> = {
	[Index in keyof TIntlLocales]: GetIntlLanguage<TIntlLocales[Index]>;
};

type Unique<T extends ReadonlyArray<unknown>> =
	T extends Readonly<[infer F, ...infer R]> ? (F extends R[number] ? Unique<R> : [F, ...Unique<R>]) : [];

export type IntlLanguage = IntlLocale extends `${infer Language}-${string}` ? Language : IntlLocale;

export function getIntlLanguage<TIntlLocale extends IntlLocale>(locale: TIntlLocale): GetIntlLanguage<TIntlLocale> {
	// oxlint-disable-next-line typescript/no-unsafe-type-assertion
	return createIntlLocale(locale).language as GetIntlLanguage<TIntlLocale>;
}

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
export const languages = unique(locales.map((locale) => getIntlLanguage(locale))) as Unique<
	GetIntlLanguages<typeof locales>
>;
