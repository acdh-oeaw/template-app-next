import type { ImageResponse } from "next/og";
import { getLocale } from "next-intl/server";

import { MetadataImage } from "@/components/metadata-image";
import { getMetadata } from "@/lib/i18n/metadata";

const size = {
	height: 630,
	width: 1200,
};

interface OpenGraphImageProps {}

/**
 * `generateImageMetadata` allows providing translated alt text,
 * but seems to overwrite `generateStaticParams`.
 *
 * @see https://github.com/vercel/next.js/issues/76323
 */
// export function generateImageMetadata(_props: OpenGraphImageProps) {
// 	return [
// 		{
// 			alt: "",
// 			id: "default",
// 			size,
// 		},
// 	];
// }

export default async function OpenGraphImage(
	_props: Readonly<OpenGraphImageProps & { id: string }>,
): Promise<ImageResponse> {
	const locale = await getLocale();
	const meta = await getMetadata();

	const title = meta.title;

	return MetadataImage({ locale, size, title });
}
