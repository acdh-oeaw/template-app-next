/** Imported by the end-to-end tests too, so it only has type imports. */
import type { StaticRoute } from "#/lib/navigation/href.ts";

/** Lists every static page, so that `bun check` reports new pages until they are included or excluded. */
export const staticPages = {
	"/": "include",
	"/accessibility": "include",
	"/about": "include",
	"/contact": "include",
	"/e2e/error": "exclude",
	"/e2e/error-boundary": "exclude",
	"/e2e/not-found": "exclude",
	"/e2e/search-params": "exclude",
	"/e2e/server-action": "exclude",
	"/imprint": "include",
	/** Results depend on the query, so crawlers should find the documents themselves instead. */
	"/search": "exclude",
} satisfies Record<StaticRoute, "exclude" | "include">;

export const sitemapPathnames = (Object.keys(staticPages) as Array<StaticRoute>).filter(
	(pathname) => staticPages[pathname] === "include",
);
