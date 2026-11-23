import type { Locale } from "#/lib/i18n/locales.ts";

declare module "next-intl" {
	interface AppConfig {
		Locale: Locale;
	}
}
