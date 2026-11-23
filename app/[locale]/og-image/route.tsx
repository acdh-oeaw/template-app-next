import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { hasLocale } from "next-intl";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";

import type { Locale } from "#/lib/i18n/locales.ts";
import { routing } from "#/lib/i18n/routing.ts";
import { openGraphImage } from "#/lib/metadata/create-page-metadata.ts";
import { getSiteMetadata } from "#/lib/metadata/site-metadata.ts";

/**
 * Not an `opengraph-image.tsx`, because:
 *
 * - Next.js links it with the internal locale, like `/de-AT/opengraph-image`, which the proxy redirects. Excluding it
 *   from the proxy `matcher`, as next-intl suggests, would serve it outside the language prefix
 * - A page that sets `openGraph` drops the images of its layout
 * - A localized alt text needs `generateImageMetadata`, which receives no params from the layout's
 *   `generateStaticParams`, so the images are not prerendered
 *
 * @see {@link https://next-intl.dev/docs/environments/actions-metadata-route-handlers#open-graph-images}
 */
export function generateStaticParams(): Array<{ locale: Locale }> {
	return routing.locales.map((locale) => {
		return { locale };
	});
}

async function createImage(locale: Locale): Promise<ArrayBuffer> {
	"use cache";

	cacheLife("max");

	const meta = await getSiteMetadata(locale);

	const logo = await readFile(join(process.cwd(), "app/icon.svg"));
	const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

	const image = new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				gap: 48,
				width: "100%",
				height: "100%",
				padding: 96,
				color: "#0a0a0a",
				backgroundColor: "#ffffff",
			}}
		>
			{/* oxlint-disable-next-line nextjs/no-img-element -- `ImageResponse` renders html, not React components */}
			<img alt="" height={160} src={logoSrc} width={145} />
			<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
				<div style={{ fontSize: 80, lineHeight: 1.1 }}>{meta.title}</div>
				<div style={{ fontSize: 40, lineHeight: 1.4, color: "#525252" }}>{meta.description}</div>
			</div>
		</div>,
		{ width: openGraphImage.width, height: openGraphImage.height },
	);

	return image.arrayBuffer();
}

export async function GET(_request: Request, context: RouteContext<"/[locale]/og-image">): Promise<Response> {
	/** `next/root-params` throws in route handlers, so read the locale from `params`. */
	const { locale } = await context.params;

	if (!hasLocale(routing.locales, locale)) {
		return new Response("Not Found", { status: 404 });
	}

	return new Response(await createImage(locale), { headers: { "Content-Type": openGraphImage.type } });
}
