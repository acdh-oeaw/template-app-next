import { log } from "@acdh-oeaw/lib";
import type { BucketItem } from "minio";
import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

import { env } from "@/config/env.config";
import { client } from "@/lib/server/images/create-client";
import { generateSignedImageUrl } from "@/lib/server/images/generate-signed-image-url";

export async function GET(_request: NextRequest): Promise<NextResponse> {
	const t = await getTranslations("api.images.list.get");

	const bucketName = env.S3_BUCKET;

	try {
		const stream = client.listObjectsV2(bucketName);

		const items: Array<{ objectName: string; url: string }> = [];

		for await (const bucketItem of stream) {
			const item = bucketItem as BucketItem;
			const objectName = item.name ?? "Unknown object";
			items.push({
				objectName,
				url: generateSignedImageUrl(bucketName, objectName, {
					resizing_type: "fit",
					width: 200,
					gravity: { type: "no" },
					enlarge: 1,
				}),
			});
		}

		return NextResponse.json({ status: "success", items });
	} catch (error) {
		log.error(error);

		return NextResponse.json(
			{ status: "error", message: t("internal-server-error") },
			{ status: 500 },
		);
	}
}
