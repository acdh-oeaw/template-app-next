import { getExtracted as getTranslations } from "next-intl/server";

import type { Locale } from "#/lib/i18n/locales.ts";
import { type Href, href } from "#/lib/navigation/href.ts";

export interface NavigationLink {
	kind: "link";
	href: Href;
	label: string;
}

export type NavigationItem = NavigationLink;

/** Async and serializable, so that the items can come from a headless cms instead. */
export async function getMainNavigation(locale: Locale): Promise<Array<NavigationItem>> {
	const t = await getTranslations({ locale });

	return [
		{ kind: "link", href: href({ pathname: "/" }), label: t("Home") },
		{ kind: "link", href: href({ pathname: "/about" }), label: t("About") },
		{ kind: "link", href: href({ pathname: "/contact" }), label: t("Contact") },
	];
}
