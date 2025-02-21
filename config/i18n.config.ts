import { type Formats, hasLocale } from "next-intl";
import { defineRouting, type LocalePrefix } from "next-intl/routing";

import type { I18nMessages } from "@/lib/i18n/get-messages";

export type IntlMessages = I18nMessages;

export const locales = ["de", "en"] as const;

export type Locale = (typeof locales)[number];

export type Language = Locale extends `${infer L}-${string}` ? L : Locale;

export const defaultLocale: Locale = "en";

export function isValidLocale(value: unknown): value is Locale {
	return hasLocale(locales, value);
}

export const localePrefix = {
	mode: "always",
	prefixes: {
		de: "/de",
		en: "/en",
	},
} satisfies LocalePrefix<typeof locales>;

export const routing = defineRouting({
	locales,
	defaultLocale,
	localePrefix,
	/**
	 * For GDPR-conformance, the locale cookie is stored as a session cookie, which expires when
	 * the browser is closed. When using an explicit cookie consent banner, the cookie expiration
	 * can be adjusted via `maxAge`.
	 */
	// localeCookie: { maxAge: 60 * 60 * 24 * 365 /** 1 year. */ },
});

export const formats = {
	dateTime: {
		long: {
			dateStyle: "long",
		},
	},
	list: {
		enumeration: {
			style: "long",
			type: "conjunction",
		},
	},
} satisfies Formats;

export type IntlFormats = typeof formats;
