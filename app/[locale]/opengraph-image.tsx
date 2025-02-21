import type { ImageResponse } from "next/og";

import { MetadataImage } from "@/components/metadata-image";
import type { Locale } from "@/config/i18n.config";
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

export function generateImageMetadata(_props: OpenGraphImageProps) {
	return [
		{
			alt: "",
			contentType: "image/png",
			id: "global",
			size,
		},
	];
}

export default async function OpenGraphImage(
	props: Readonly<OpenGraphImageProps & { id: string }>,
): Promise<ImageResponse> {
	const { params } = props;

	const { locale } = params;

	const meta = await getMetadata(locale);

	const title = meta.title;

	return MetadataImage({ locale, size, title });
}
