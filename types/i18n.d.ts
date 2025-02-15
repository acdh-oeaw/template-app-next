import type { _IntlFormats, _IntlMessages, Locale } from "@/config/i18n.config";

declare global {
	type Formats = _IntlFormats;

	interface IntlFormats extends Formats {}

	type Messages = _IntlMessages;

	interface IntlMessages extends Messages {}
}

declare module "next-intl" {
	export function useLocale(): Locale;
}

declare module "next-intl/server" {
	export function getLocale(): Promise<Locale>;
}
