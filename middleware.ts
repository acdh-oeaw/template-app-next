import type { MiddlewareConfig, NextMiddleware } from "next/server";

import { middleware as i18nMiddlware } from "@/lib/i18n/middleware";
import { composeMiddleware } from "@/lib/server/compose-middlewares";
import { middleware as csrfMiddlware } from "@/lib/server/csrf/csrf-middleware";

export const middleware: NextMiddleware = composeMiddleware(csrfMiddlware, i18nMiddlware);

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
