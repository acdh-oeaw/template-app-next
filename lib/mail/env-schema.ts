import * as v from "valibot";

/** The defaults are the smtp server of the ÖAW, which accepts mail from the ACDH cluster without credentials. */
export const mailEnvEntries = {
	EMAIL_FROM: v.optional(
		v.pipe(
			v.string(),
			v.email(),
			v.description("Email address that the app sends mail from, which the smtp server must be allowed to send from."),
			v.metadata({ dev: "noreply@example.com" }),
		),
		"noreply@oeaw.ac.at",
	),
	EMAIL_SMTP_HOST: v.optional(
		v.pipe(
			v.string(),
			v.nonEmpty(),
			v.description("Host of the smtp server that sends mail."),
			v.metadata({ dev: "localhost" }),
		),
		"smtp.oeaw.ac.at",
	),
	EMAIL_SMTP_PASSWORD: v.optional(v.pipe(v.string(), v.description("Password for the smtp server."))),
	EMAIL_SMTP_PORT: v.optional(
		v.pipe(
			v.string(),
			v.digits(),
			v.transform(Number),
			v.description(
				"Port of the smtp server. Port 465 uses implicit TLS, other ports require STARTTLS, except on localhost.",
			),
			v.metadata({ dev: "1025" }),
		),
		"587",
	),
	EMAIL_SMTP_USERNAME: v.optional(v.pipe(v.string(), v.description("User name for the smtp server."))),
} satisfies v.ObjectEntries;
