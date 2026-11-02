import type { MetadataRoute } from "next";

import { defaultLocale } from "#/lib/i18n/locales.ts";
import { getPathname } from "#/lib/i18n/navigation.ts";
import { getSiteMetadata } from "#/lib/metadata/site-metadata.ts";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
	const meta = await getSiteMetadata(defaultLocale);

	return {
		name: meta.manifest.name,
		short_name: meta.manifest.shortName,
		description: meta.description,
		start_url: getPathname({ locale: defaultLocale, href: "/" }),
		display: "standalone",
		icons: [
			{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
			{ src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
		],
	};
}
