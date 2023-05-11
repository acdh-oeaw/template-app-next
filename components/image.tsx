import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { assert, request } from "@acdh-oeaw/lib";
import { imageSize } from "image-size";
// eslint-disable-next-line no-restricted-imports
import NextImage, { type ImageProps as NextImageProps } from "next/image";
import type { ReactNode } from "react";

interface ImageProps extends NextImageProps {}

export async function Image(props: ImageProps): Promise<Awaited<ReactNode>> {
	const { alt = "", fill, height, src, width } = props;

	if (typeof src === "object" || fill === true || (width != null && height != null)) {
		return <NextImage {...props} alt={alt} />;
	}

	if (src.startsWith("blob:") || src.startsWith("data:")) {
		// eslint-disable-next-line @next/next/no-img-element
		return <img {...props} alt={alt} loading="lazy" src={src} />;
	}

	const buffer = await getImageData(src);
	const image = imageSize(buffer);

	// if (image.type === "svg") {
	// 	// eslint-disable-next-line @next/next/no-img-element
	// 	return <img {...props} alt={alt} loading="lazy" src={src} />;
	// }

	return <NextImage {...props} alt={alt} height={image.height} width={image.width} />;
}

function getImageData(src: string): Promise<Uint8Array> {
	if (URL.canParse(src)) {
		return request(src, { responseType: "arrayBuffer" }) as Promise<Uint8Array>;
	}

	assert(src.startsWith("/"), "Images with relative paths are not supported.");

	return readFile(join(process.cwd(), "public", src));
}
