import { getExtracted as getTranslations } from "next-intl/server";

import type { Locale } from "#/lib/i18n/locales.ts";

export interface NavigationLink {
	kind: "link";
	/** Pathname without locale prefix. */
	href: string;
	label: string;
}

export type NavigationItem = NavigationLink;

/** Async and serializable, so that the items can come from a headless cms instead. */
export async function getMainNavigation(locale: Locale): Promise<Array<NavigationItem>> {
	const t = await getTranslations({ locale });

	return [
		{ kind: "link", href: "/", label: t("Home") },
		{ kind: "link", href: "/about", label: t("About") },
	];
}
