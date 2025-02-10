"use server";

import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";

import { getFormDataValues, includes, log } from "@acdh-oeaw/lib";
import { getTranslations } from "next-intl/server";
import * as v from "valibot";

import { assertImageServicePermissions } from "@/app/[locale]/images/_lib/assert-image-service-permissions";
import { imageMimeTypes, imageSizeLimit } from "@/config/images.config";
import {
	type ActionState,
	createErrorActionState,
	createSuccessActionState,
} from "@/lib/server/actions";
import { ForbiddenError, RateLimitError } from "@/lib/server/errors";
import { createClient } from "@/lib/server/images/create-client";
import { globalPOSTRateLimit } from "@/lib/server/rate-limit/global-rate-limit";

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

export async function createImageAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const t = await getTranslations("createImageAction");
	const e = await getTranslations("errors");

	try {
		if (!(await globalPOSTRateLimit())) {
			throw new RateLimitError();
		}

		await assertImageServicePermissions();

		const { file } = await v.parseAsync(CreateImageInputSchema, getFormDataValues(formData));

		const fileName = file.name;
		// eslint-disable-next-line n/no-unsupported-features/node-builtins
		const fileStream = Readable.fromWeb(file.stream() as ReadableStream);
		const fileSize = file.size;
		const metadata = { "Content-Type": file.type };

		const client = await createClient();
		const { objectName } = await client.images.create(fileName, fileStream, fileSize, metadata);

		return createSuccessActionState({ message: t("success"), data: { objectName } });
	} catch (error) {
		log.error(error);

		if (error instanceof ForbiddenError) {
			return createErrorActionState({ message: e("forbidden") });
		}

		if (error instanceof RateLimitError) {
			return createErrorActionState({ message: e("too-many-requests") });
		}

		if (v.isValiError<typeof CreateImageInputSchema>(error)) {
			const errors = v.flatten<typeof CreateImageInputSchema>(error.issues);

			return createErrorActionState({
				message: errors.root ?? e("invalid-form-fields"),
				errors: errors.nested,
			});
		}

		return createErrorActionState({ message: e("internal-server-error") });
	}
}
