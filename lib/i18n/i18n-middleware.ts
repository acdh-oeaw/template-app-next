import createI18nMiddleware from "next-intl/middleware";

import { defaultLocale, localePrefix, locales } from "@/config/i18n.config";
import type { Middleware } from "@/lib/compose-middlewares";

const middleware = createI18nMiddleware({
	defaultLocale,
	localePrefix,
	locales,
});

export const i18nMiddlware: Middleware = function i18nMiddleware(request, response) {
	if (request.method === "GET" && !request.nextUrl.pathname.startsWith("/api")) {
		return middleware(request);
	}

	return response;
};
