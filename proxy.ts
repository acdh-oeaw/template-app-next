import type { NextProxy, ProxyConfig } from "next/server";

import { middleware as csrfMiddleware } from "#/lib/middleware/csrf.middleware.ts";
import { middleware as i18nMiddleware } from "#/lib/middleware/i18n.middleware.ts";
import { composeMiddleware } from "#/lib/server/middleware.ts";

export const proxy: NextProxy = composeMiddleware(csrfMiddleware, i18nMiddleware);

export const config: ProxyConfig = {
	matcher: ["/", "/(de|en)/:path*", "/api/:path*"],
};
