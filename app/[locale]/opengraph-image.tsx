import type { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { MetadataImage } from "@/components/metadata-image";
import type { Locale } from "@/config/i18n.config";

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
			id: "default",
			size,
		},
	];
}

export default async function OpenGraphImage(
	props: Readonly<OpenGraphImageProps & { id: string }>,
): Promise<ImageResponse> {
	const { params } = props;

	const { locale } = params;
	const meta = await getTranslations({ locale, namespace: "metadata" });

	const title = meta("title");

	return MetadataImage({ locale, size, title });
}
