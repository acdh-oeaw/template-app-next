import { type Writable } from "ts-essentials";

import type de from "@/messages/de.json";
import type en from "@/messages/en.json";

const _locales = ["de", "en"] as const;
export const locales = _locales as Writable<typeof _locales>;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export interface Translations extends Record<Locale, IntlMessages> {
	de: typeof de;
	en: typeof en;
}
