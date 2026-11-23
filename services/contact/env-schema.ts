import * as v from "valibot";

export const contactEnvEntries = {
	CONTACT_FORM_RECIPIENT: v.pipe(
		v.string(),
		v.email(),
		v.description("Email address that receives the messages of the contact form."),
		v.metadata({ dev: "contact@example.com" }),
	),
} satisfies v.ObjectEntries;
