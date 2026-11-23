"use server";

import { getExtracted } from "next-intl/server";
import * as v from "valibot";

import { env } from "#/lib/env/server.ts";
import { getMailer } from "#/lib/mail/get-mailer.ts";
import { createRateLimiter } from "#/lib/rate-limit/rate-limiter.ts";
import { createServerAction } from "#/lib/server-actions/create-server-action.ts";
import { rateLimit } from "#/lib/server-actions/rate-limit.ts";
import { sendContactMessage } from "#/services/contact/send-contact-message.ts";

const rateLimiter = createRateLimiter({ name: "contact", limit: 5, windowMs: 60 * 60 * 1000 });

export const sendContactMessageAction = createServerAction({
	async guard(context) {
		await rateLimit(context, rateLimiter);
	},
	async schema({ locale }) {
		const t = await getExtracted({ locale });

		return v.object({
			name: v.pipe(v.string(), v.trim(), v.nonEmpty(t("Enter your name.")), v.maxLength(200)),
			email: v.pipe(
				v.string(),
				v.trim(),
				v.nonEmpty(t("Enter your email address.")),
				v.email(t("Enter a valid email address.")),
			),
			message: v.pipe(v.string(), v.trim(), v.nonEmpty(t("Enter a message.")), v.maxLength(5000)),
			website: v.optional(v.string(), ""),
		});
	},
	async handler(input) {
		const result = await sendContactMessage(
			{ name: input.name, email: input.email, message: input.message, honeypot: input.website },
			{ mailer: getMailer(), recipient: env.CONTACT_FORM_RECIPIENT },
		);

		switch (result.status) {
			/** Bots see the same response as people, so they don't learn to avoid the honeypot. */
			case "sent":
			case "spam": {
				return;
			}
		}
	},
});
