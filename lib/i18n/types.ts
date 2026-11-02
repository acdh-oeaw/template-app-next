import type { Locale } from "#/configs/i18n.config.ts";

declare module "next-intl" {
	interface AppConfig {
		Locale: Locale;
	}
}
