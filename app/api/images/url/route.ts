import { log } from "@acdh-oeaw/lib";
import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import * as v from "valibot";

import { env } from "@/config/env.config";
import { generateObjectName } from "@/lib/server/images/generate-object-name";
import { generateSignedImageUrl } from "@/lib/server/images/generate-signed-image-url";

const ImageNameInputSchema = v.pipe(v.string(), v.nonEmpty());

export async function POST(request: NextRequest): Promise<NextResponse> {
	const t = await getTranslations("api.images.url.post");

	/** FIXME: Needs proper access control. */

	try {
		const formData = await request.formData();
		const name = v.parse(ImageNameInputSchema, formData.get("name"));

		const bucketName = env.S3_BUCKET;
		const objectName = generateObjectName(name);

		const url = generateSignedImageUrl(bucketName, objectName, {
			resizing_type: "fit",
			width: 800,
			gravity: { type: "no" },
			enlarge: 1,
		});

		return NextResponse.json({ status: "success", objectName, url });
	} catch (error) {
		log.error(error);

		if (error instanceof v.ValiError) {
			return NextResponse.json({ status: "error", message: t("invalid-input") }, { status: 400 });
		}

		return NextResponse.json(
			{ status: "error", message: t("internal-server-error") },
			{ status: 500 },
		);
	}
}
