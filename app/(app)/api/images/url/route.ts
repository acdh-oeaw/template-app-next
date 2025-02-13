import { log } from "@acdh-oeaw/lib";
import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import * as v from "valibot";

import { assertImageServicePermissions } from "@/app/(app)/api/images/_lib/assert-image-service-permissions";
import { ForbiddenError } from "@/lib/server/errors";
import { createClient } from "@/lib/server/images/create-client";

const GetSignedImageUrlInputSchema = v.object({
	"object-name": v.pipe(v.string(), v.nonEmpty()),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
	const e = await getTranslations("api.errors");

	try {
		await assertImageServicePermissions(request);

		const searchParams = new URL(request.url).searchParams;
		const { "object-name": objectName } = await v.parseAsync(GetSignedImageUrlInputSchema, {
			objectName: searchParams.get("object-name"),
		});

		const client = await createClient();
		const urls = client.signedImageUrls.get(objectName);

		return NextResponse.json({ status: "success", objectName, urls });
	} catch (error) {
		log.error(error);

		if (error instanceof ForbiddenError) {
			return NextResponse.json({ status: "error", message: e("forbidden") }, { status: 403 });
		}

		if (v.isValiError<typeof GetSignedImageUrlInputSchema>(error)) {
			return NextResponse.json(
				{ status: "error", message: e("invalid-form-fields") },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ status: "error", message: e("internal-server-error") },
			{ status: 500 },
		);
	}
}
