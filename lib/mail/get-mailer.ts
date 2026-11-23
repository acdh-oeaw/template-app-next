import "server-only";

import { env } from "#/lib/env/server.ts";
import { createSmtpMailer, type Mailer } from "#/lib/mail/mailer.ts";

let mailer: Mailer | undefined;

/** Created on first use, so that pages which import an action using it don't read the variables at build time. */
export function getMailer(): Mailer {
	mailer ??= createSmtpMailer({
		host: env.EMAIL_SMTP_HOST,
		port: env.EMAIL_SMTP_PORT,
		username: env.EMAIL_SMTP_USERNAME,
		password: env.EMAIL_SMTP_PASSWORD,
		from: env.EMAIL_FROM,
	});

	return mailer;
}
