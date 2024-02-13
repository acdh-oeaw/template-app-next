// import type { MiddlewareConfig } from "next/server";
import createI18nMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "@/config/i18n.config";
import { auth as authMiddleware } from "@/lib/auth";

const i18nMiddleware = createI18nMiddleware({
	defaultLocale,
	locales,
});

export default authMiddleware((req) => {
	/**
	 * Don't add locale prefixes to api routes (in case they are included in the
	 * middleware `matcher` config).
	 */
	if (req.nextUrl.pathname.startsWith("/api/")) return null;

	return i18nMiddleware(req);
});

export const config = {
	/**
	 * Next.js does not support arbitrary expressions for `matcher`.
	 *
	 * @see https://github.com/vercel/next.js/issues/56398
	 */
	// matcher: ["/", `/(${locales.join("|")})/:path*`],
	matcher: [
		"/",
		"/(de|en)/:path*",
		"/auth/:path*",
		// "/api/:path*"
	],
};
