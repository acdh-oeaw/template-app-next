import { generateImageUrl, type IGenerateImageUrl } from "@imgproxy/imgproxy-node";

import { env } from "@/config/env.config";

export type Options = IGenerateImageUrl["options"];

export function generateSignedImageUrl(
	bucketName: string,
	objectName: string,
	options: Options,
): string {
	const url = generateImageUrl({
		endpoint: env.IMGPROXY_BASE_URL,
		url: `s3://${bucketName}/${objectName}`,
		/** @see @see https://github.com/imgproxy/imgproxy-js-core/pull/26 */
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		options,
		salt: env.IMGPROXY_SALT,
		key: env.IMGPROXY_KEY,
	});

	return url;
}
