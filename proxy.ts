import createMiddleware from "next-intl/middleware";

import { routing } from "#/lib/i18n/routing.ts";

export default createMiddleware(routing);

export const config = {
	matcher: [
		"/((?!api/|_next/|_vercel/|.*\\.(?:avif|css|csv|gif|ico|jpe?g|js|json|pdf|png|svg|txt|webmanifest|webp|woff2?|xml)$).*)",
	],
};
