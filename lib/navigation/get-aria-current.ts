import type { Href } from "#/lib/navigation/href.ts";

export type AriaCurrent = "page" | "true" | undefined;

/**
 * Marks a link to the current page, and links to an ancestor of the current page, but not as the current page. Search
 * params and the hash of the link are ignored, because navigation menus mark sections of the site. Components where
 * search params select the page, like pagination, set `aria-current` from their decoded search params instead.
 */
export function getAriaCurrent(pathname: Href, href: Href): AriaCurrent {
	const target = href.split(/[?#]/, 1)[0] ?? href;

	if (pathname === target) {
		return "page";
	}

	if (target !== "/" && pathname.startsWith(`${target}/`)) {
		return "true";
	}

	return undefined;
}
