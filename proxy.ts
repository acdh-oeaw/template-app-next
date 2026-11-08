import createMiddleware from "next-intl/middleware";

import { routing } from "#/lib/i18n/routing.ts";

export default createMiddleware(routing);

export const config = {
	matcher: [
		/**
		 * Run locale negotiation for every page path, including ones that contain a dot (like `/users/jane.doe`), but skip
		 * api routes, framework internals, and static files, which are matched by known file extensions rather than by any
		 * dot.
		 */
		"/((?!api/|_next/|_vercel/|.*\\.(?:avif|css|csv|gif|ico|jpe?g|js|json|pdf|png|svg|txt|webmanifest|webp|woff2?|xml)$).*)",
	],
};
