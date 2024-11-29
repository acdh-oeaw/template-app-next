"use server";

import { getFormDataValues, log } from "@acdh-oeaw/lib";
import { getTranslations } from "next-intl/server";
import * as v from "valibot";

import { env } from "@/config/env.config";
import {
	type ActionState,
	createErrorActionState,
	createSuccessActionState,
} from "@/lib/server/actions";
import { sendEmail } from "@/lib/server/email/send-email";
import { isHoneypotError, isRateLimitError } from "@/lib/server/errors";
import { assertValidFormSubmission } from "@/lib/server/honeypot";
import { assertGlobalGetRateLimit } from "@/lib/server/rate-limit/global-rate-limit";

const ContactFormSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	message: v.pipe(v.string(), v.nonEmpty()),
	subject: v.pipe(v.string(), v.nonEmpty()),
});

export async function sendContactFormEmailAction(
	state: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const t = await getTranslations("sendContactFormEmailAction");
	const e = await getTranslations("errors");

	try {
		await assertGlobalGetRateLimit();

		assertValidFormSubmission(formData);

		const { email, message, subject } = await v.parseAsync(
			ContactFormSchema,
			getFormDataValues(formData),
		);

		const info = await sendEmail({
			from: email,
			to: env.EMAIL_ADDRESS,
			subject,
			text: message,
		});

		log.info(info);
	} catch (error) {
		log.error(error);

		if (isRateLimitError(error)) {
			return createErrorActionState({ message: e("too-many-requests") });
		}

		if (isHoneypotError(error)) {
			return createErrorActionState({ message: e("invalid-form-fields") });
		}

		if (v.isValiError<typeof ContactFormSchema>(error)) {
			const errors = v.flatten<typeof ContactFormSchema>(error.issues).nested;
			return createErrorActionState({ message: e("invalid-form-fields"), errors });
		}

		return createErrorActionState({ message: t("error") });
	}

	return createSuccessActionState({ message: t("success") });
}
