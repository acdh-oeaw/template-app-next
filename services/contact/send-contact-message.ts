import type { Mailer } from "#/lib/mail/mailer.ts";

export interface ContactMessage {
	name: string;
	email: string;
	message: string;
	/** A field that people don't see, so a value means that a bot filled in the form. */
	honeypot: string;
}

interface SendContactMessageDependencies {
	mailer: Mailer;
	/** The address that receives the messages. */
	recipient: string;
}

export type SendContactMessageResult = { status: "sent" } | { status: "spam" };

export async function sendContactMessage(
	input: ContactMessage,
	dependencies: SendContactMessageDependencies,
): Promise<SendContactMessageResult> {
	const { mailer, recipient } = dependencies;

	if (input.honeypot !== "") {
		return { status: "spam" };
	}

	await mailer.send({
		to: recipient,
		/** Replies go to the sender, while the mail is sent from the app's address, which passes SPF and DMARC. */
		replyTo: { name: input.name, address: input.email },
		subject: `Contact form: ${input.name}`,
		text: `${input.name} <${input.email}> wrote:\n\n${input.message}`,
	});

	return { status: "sent" };
}
