import type { MiddlewareConfig, NextMiddleware } from "next/server";

import { i18nMiddlware } from "@/lib/i18n/i18n-middleware";
import { sessionExtensionMiddleware } from "@/lib/server/auth/session-extension-middleware";
import { composeMiddleware } from "@/lib/server/compose-middlewares";
import { csrfMiddlware } from "@/lib/server/csrf/csrf-middleware";

export const middleware: NextMiddleware = composeMiddleware(
	csrfMiddlware,
	i18nMiddlware,
	sessionExtensionMiddleware,
);

export const config: MiddlewareConfig = {
	matcher: [
		"/",
		/**
		 * Next.js does not support arbitrary expressions for `matcher`.
		 *
		 * @see https://github.com/vercel/next.js/issues/56398
		 */
		"/(de|en)/:path*",
		"/api/:path*",
	],
};
