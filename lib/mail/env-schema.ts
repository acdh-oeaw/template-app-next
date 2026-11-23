import * as v from "valibot";

export const mailEnvEntries = {
	EMAIL_FROM: v.pipe(
		v.string(),
		v.email(),
		v.description("Email address that the app sends mail from, which the smtp server must be allowed to send from."),
		v.metadata({ dev: "noreply@example.com" }),
	),
	EMAIL_SMTP_HOST: v.pipe(
		v.string(),
		v.nonEmpty(),
		v.description("Host of the smtp server that sends mail."),
		v.metadata({ dev: "localhost" }),
	),
	EMAIL_SMTP_PASSWORD: v.optional(v.pipe(v.string(), v.description("Password for the smtp server."))),
	EMAIL_SMTP_PORT: v.pipe(
		v.string(),
		v.digits(),
		v.transform(Number),
		v.description("Port of the smtp server. Port 465 uses implicit TLS, other ports STARTTLS when available."),
		v.metadata({ dev: "1025" }),
	),
	EMAIL_SMTP_USERNAME: v.optional(v.pipe(v.string(), v.description("User name for the smtp server."))),
} satisfies v.ObjectEntries;
