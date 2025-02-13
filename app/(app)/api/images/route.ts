import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";

import { getFormDataValues, includes, log } from "@acdh-oeaw/lib";
import { S3Error } from "minio";
import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import * as v from "valibot";

import { assertImageServicePermissions } from "@/app/(app)/api/images/_lib/assert-image-service-permissions";
import { imageMimeTypes, imageSizeLimit } from "@/config/images.config";
import { ForbiddenError, RateLimitError } from "@/lib/server/errors";
import { createClient } from "@/lib/server/images/create-client";
import { globalPOSTRateLimit } from "@/lib/server/rate-limit/global-rate-limit";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const e = await getTranslations("api.errors");

	try {
		await assertImageServicePermissions(request);

		const client = await createClient();
		const _images = await client.images.all();

		const images = _images.map((image) => {
			const urls = client.signedImageUrls.get(image.objectName);
			return { ...image, urls };
		});

		return NextResponse.json({ status: "success", images });
	} catch (error) {
		log.error(error);

		if (error instanceof ForbiddenError) {
			return NextResponse.json({ status: "error", message: e("forbidden") }, { status: 403 });
		}

		return NextResponse.json(
			{ status: "error", message: e("internal-server-error") },
			{ status: 500 },
		);
	}
}

//

const CreateImageInputSchema = v.object({
	file: v.pipe(
		v.instance(File),
		v.check((input) => {
			return includes(imageMimeTypes, input.type);
		}),
		v.check((input) => {
			return input.size <= imageSizeLimit;
		}),
	),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
	const t = await getTranslations("api.images.post");
	const e = await getTranslations("api.errors");

	try {
		if (!(await globalPOSTRateLimit())) {
			throw new RateLimitError();
		}

		await assertImageServicePermissions(request);

		const formData = await request.formData();
		const { file } = v.parse(CreateImageInputSchema, getFormDataValues(formData));

		const fileName = file.name;
		const fileStream = Readable.fromWeb(file.stream() as ReadableStream);
		const fileSize = file.size;
		const metadata = { "Content-Type": file.type };

		const client = await createClient();
		const { objectName } = await client.images.create(fileName, fileStream, fileSize, metadata);

		const urls = client.signedImageUrls.get(objectName);

		return NextResponse.json({ status: "success", objectName, urls });
	} catch (error) {
		log.error(error);

		if (error instanceof ForbiddenError) {
			return NextResponse.json({ status: "error", message: e("forbidden") }, { status: 403 });
		}

		if (v.isValiError<typeof CreateImageInputSchema>(error)) {
			return NextResponse.json(
				{ status: "error", message: e("invalid-form-fields") },
				{ status: 400 },
			);
		}

		if (error instanceof S3Error) {
			return NextResponse.json({ status: "error", message: t("upload-error") }, { status: 500 });
		}

		return NextResponse.json(
			{ status: "error", message: e("internal-server-error") },
			{ status: 500 },
		);
	}
}
