import type { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import createI18nMiddleware from "next-intl/middleware";

import { defaultLocale, localePrefix, locales } from "@/config/i18n.config";
import { csrfMiddlware } from "@/lib/auth/csrf-middleware";
import { sessionExtensionMiddleware } from "@/lib/auth/session-extension-middleware";

const i18nMiddleware = createI18nMiddleware({
	defaultLocale,
	localePrefix,
	locales,
});

export function middleware(request: NextRequest): NextResponse {
	return i18nMiddleware(request);
}

export const config: MiddlewareConfig = {
	matcher: [
		"/",
		/**
		 * Next.js does not support arbitrary expressions for `matcher`.
		 *
		 * @see https://github.com/vercel/next.js/issues/56398
		 */
		"/(de|en)/:path*",
		// "/api/:path*",
	],
};
