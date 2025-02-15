import type { Formats } from "next-intl";
import { defineRouting, type LocalePrefix } from "next-intl/routing";

import type { Messages } from "@/lib/i18n/get-request-config";

export const locales = ["de", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isValidLocale(value: string): value is Locale {
	return locales.includes(value as Locale);
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

/** Globally available via `types/i18n.d.ts` */
export type _IntlFormats = typeof formats;

/** Globally available via `types/i18n.d.ts` */
export type _IntlMessages = Messages;
