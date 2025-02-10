import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";

import { includes, log } from "@acdh-oeaw/lib";
import { S3Error } from "minio";
import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import * as v from "valibot";

import { env } from "@/config/env.config";
import { imageMimeTypes, imageSizeLimit } from "@/config/images.config";
import { client } from "@/lib/server/images/create-client";
import { generateObjectName } from "@/lib/server/images/generate-object-name";
import { generateSignedImageUrl } from "@/lib/server/images/generate-signed-image-url";

const ImageFileInputSchema = v.pipe(
	v.instance(File),
	v.check((input) => {
		return includes(imageMimeTypes, input.type);
	}),
	v.check((input) => {
		return input.size <= imageSizeLimit;
	}),
);

export async function POST(request: NextRequest): Promise<NextResponse> {
	const t = await getTranslations("api.images.upload.post");

	/** FIXME: Needs proper access control. */

	try {
		const formData = await request.formData();
		const file = v.parse(ImageFileInputSchema, formData.get("file"));

		const bucketName = env.S3_BUCKET;
		const objectName = generateObjectName(file.name);
		const fileStream = Readable.fromWeb(file.stream() as ReadableStream);
		const fileSize = file.size;
		const metadata = { "Content-Type": file.type };

		const _response = await client.putObject(
			bucketName,
			objectName,
			fileStream,
			fileSize,
			metadata,
		);

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

		if (error instanceof S3Error) {
			return NextResponse.json({ status: "error", message: t("upload-error") }, { status: 500 });
		}

		return NextResponse.json(
			{ status: "error", message: t("internal-server-error") },
			{ status: 500 },
		);
	}
}
