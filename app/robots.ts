import type { MetadataRoute } from "next";

import { env } from "#/lib/env/public.ts";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: new URL("/sitemap.xml", env.NEXT_PUBLIC_APP_BASE_URL).href,
	};
}
