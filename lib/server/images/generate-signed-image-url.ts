import { generateImageUrl, type IGenerateImageUrl } from "@imgproxy/imgproxy-node";

import { env } from "@/config/env.config";

export function generateSignedImageUrl(
	bucketName: string,
	objectName: string,
	options: IGenerateImageUrl["options"],
): string {
	const url = generateImageUrl({
		endpoint: env.IMGPROXY_BASE_URL,
		url: `s3://${bucketName}/${objectName}`,
		options,
		salt: env.IMGPROXY_SALT,
		key: env.IMGPROXY_KEY,
	});

	return url;
}
