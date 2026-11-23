import { describe, expect, test } from "bun:test";

import type { Mail, Mailer } from "#/lib/mail/mailer.ts";
import { type ContactMessage, sendContactMessage } from "#/services/contact/send-contact-message.ts";

function createFakeMailer(): Mailer & { sent: Array<Mail> } {
	const sent: Array<Mail> = [];

	return {
		sent,
		// oxlint-disable-next-line require-await -- implements an async interface
		async send(mail) {
			sent.push(mail);
		},
	};
}

const message: ContactMessage = {
	name: "Ada Lovelace",
	email: "ada@example.com",
	message: "Hello!",
	honeypot: "",
};

describe("sendContactMessage", () => {
	test("sends the message to the recipient, with replies to the sender", async () => {
		const mailer = createFakeMailer();

		const result = await sendContactMessage(message, { mailer, recipient: "team@example.com" });

		expect(result).toStrictEqual({ status: "sent" });
		expect(mailer.sent).toStrictEqual([
			{
				to: "team@example.com",
				replyTo: { name: "Ada Lovelace", address: "ada@example.com" },
				subject: "Contact form: Ada Lovelace",
				text: "Ada Lovelace <ada@example.com> wrote:\n\nHello!",
			},
		]);
	});

	test("drops messages with a filled honeypot", async () => {
		const mailer = createFakeMailer();

		const result = await sendContactMessage(
			{ ...message, honeypot: "https://example.com" },
			{ mailer, recipient: "team@example.com" },
		);

		expect(result).toStrictEqual({ status: "spam" });
		expect(mailer.sent).toStrictEqual([]);
	});

	test("throws when the mail cannot be sent", async () => {
		const error = new Error("Connection refused");
		const mailer: Mailer = {
			send() {
				return Promise.reject(error);
			},
		};

		const reason: unknown = await sendContactMessage(message, { mailer, recipient: "team@example.com" }).catch(
			(error: unknown) => error,
		);

		expect(reason).toBe(error);
	});
});
