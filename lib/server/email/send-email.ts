import { createTransport, type SendMailOptions } from "nodemailer";

import { env } from "@/config/env.config";

interface SendEmailParams
	extends Pick<SendMailOptions, "attachments" | "from" | "html" | "subject" | "text" | "to"> {}

export function sendEmail(params: SendEmailParams) {
	const { attachments, from, html, subject, text, to } = params;

	const transporter = createTransport({
		host: env.EMAIL_SMTP_SERVER,
		port: env.EMAIL_SMTP_PORT,
		secure: false,
	});

	return transporter.sendMail({
		from,
		to,
		subject,
		text,
		html,
		attachments,
	});
}
