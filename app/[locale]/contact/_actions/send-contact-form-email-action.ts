"use server";

import { getFormDataValues, log } from "@acdh-oeaw/lib";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { env } from "@/config/env.config";
import { getIntlLanguage } from "@/lib/i18n/locales";
import {
	type ActionState,
	createErrorActionState,
	createSuccessActionState,
} from "@/lib/server/actions";
import { sendEmail } from "@/lib/server/email/send-email";
import { isHoneypotError, isRateLimitError } from "@/lib/server/errors";
import { assertValidFormSubmission } from "@/lib/server/honeypot";
import { assertGlobalPostRateLimit } from "@/lib/server/rate-limit/global-rate-limit";

const ContactFormSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	message: v.pipe(v.string(), v.nonEmpty()),
	subject: v.pipe(v.string(), v.nonEmpty()),
});

export async function sendContactFormEmailAction(
	state: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("actions.sendContactFormEmailAction");
	const e = await getTranslations("errors");

	try {
		await assertGlobalPostRateLimit();

		assertValidFormSubmission(formData);

		const { email, message, subject } = await v.parseAsync(
			ContactFormSchema,
			getFormDataValues(formData),
			{ lang: getIntlLanguage(locale) },
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
			return createErrorActionState({ message: e("too-many-requests"), formData });
		}

		if (isHoneypotError(error)) {
			return createErrorActionState({ message: e("invalid-form-fields"), formData });
		}

		if (v.isValiError<typeof ContactFormSchema>(error)) {
			const errors = v.flatten<typeof ContactFormSchema>(error.issues).nested;
			return createErrorActionState({ message: e("invalid-form-fields"), errors, formData });
		}

		return createErrorActionState({ message: t("error"), formData });
	}

	return createSuccessActionState({ message: t("success") });
}
