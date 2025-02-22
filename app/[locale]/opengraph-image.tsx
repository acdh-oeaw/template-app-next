import { notFound } from "next/navigation";
import type { ImageResponse } from "next/og";

import { MetadataImage } from "@/components/metadata-image";
import { isValidLocale, type Locale, locales } from "@/config/i18n.config";
import { getMetadata } from "@/lib/i18n/get-metadata";

const size = {
	height: 630,
	width: 1200,
};

interface OpenGraphImageProps {
	params: {
		locale: Locale;
	};
}

export const dynamicParams = false;

export function generateStaticParams(): Array<Awaited<OpenGraphImageProps["params"]>> {
	return locales.map((locale) => {
		return { locale };
	});
}

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
	props: Readonly<OpenGraphImageProps & { id: string }>,
): Promise<ImageResponse> {
	const { params } = props;

	const { locale } = params;
	if (!isValidLocale(locale)) {
		notFound();
	}

	const meta = await getMetadata(locale);

	const title = meta.title;

	return MetadataImage({ locale, size, title });
}
