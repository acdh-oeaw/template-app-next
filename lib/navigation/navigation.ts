import { createNavigation } from "next-intl/navigation";

import type { Locale } from "#/lib/i18n/locales.ts";
import { routing } from "#/lib/i18n/routing.ts";
import type { Href } from "#/lib/navigation/href.ts";

const navigation = createNavigation(routing);

/** Use `<Link>` from `components/link.tsx`, which requires an href created with `href()` or `externalHref()`. */
export const { Link } = navigation;

interface NavigationParams {
	href: Href;
	locale: Locale;
}

export function getPathname(params: Readonly<NavigationParams>): string {
	return navigation.getPathname(params);
}

export function redirect(params: Readonly<NavigationParams>): never {
	return navigation.redirect(params);
}

export function permanentRedirect(params: Readonly<NavigationParams>): never {
	return navigation.permanentRedirect(params);
}
