import type { Href } from "#/lib/navigation/href.ts";

export type AriaCurrent = "page" | "true" | undefined;

/**
 * Marks a link to the current page, and links to an ancestor of the current page, but not as the current page. Search
 * params and the hash of the link are ignored.
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
