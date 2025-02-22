import { includes } from "@acdh-oeaw/lib";
import createI18nMiddleware from "next-intl/middleware";

import { localePrefix, routing } from "@/config/i18n.config";
import { removeTrailingSlash } from "@/lib/remove-trailing-slash";
import type { Middleware } from "@/lib/server/compose-middlewares";

const middleware = createI18nMiddleware(routing);

export const i18nMiddlware: Middleware = function i18nMiddleware(request, response) {
	if (request.method === "GET" && !request.nextUrl.pathname.startsWith("/api")) {
		const response = middleware(request);

		/**
		 * 'next-intl` v4 adds an `x-default` alternate link for all routes,
		 * which we don't want, since we only redirect on "/".
		 *
		 * @see https://next-intl.dev/docs/routing#alternate-links
		 */
		const pathname = removeTrailingSlash(request.nextUrl.pathname);

		if (!includes(Object.values(localePrefix.prefixes), pathname)) {
			const header = response.headers.get("link");

			if (header != null) {
				const links = header.split(",").filter((link) => {
					return !(link.includes('rel="alternate"') && link.includes('hreflang="x-default"'));
				});

				response.headers.set("link", links.join(","));
			}
		}

		return response;
	}

	return response;
};
