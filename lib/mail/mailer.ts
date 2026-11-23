import { createTransport, type Transporter } from "nodemailer";

export interface MailAddress {
	name: string;
	address: string;
}

export interface Mail {
	to: string;
	replyTo?: MailAddress;
	subject: string;
	text: string;
}

/** Services depend on this interface rather than on nodemailer, so that tests can pass a fake. */
export interface Mailer {
	send: (mail: Mail) => Promise<void>;
}

interface SmtpMailerOptions {
	host: string;
	port: number;
	username?: string;
	password?: string;
	/** The address of the app, which the mail server is allowed to send from. */
	from: string;
}

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

export function createSmtpMailer(options: SmtpMailerOptions): Mailer {
	const { host, port, username, password, from } = options;

	const secure = port === 465;

	const transport = createTransport({
		host,
		port,
		secure,
		/**
		 * Other ports must upgrade with STARTTLS, so mail is never sent in plain text, except to a local server like
		 * Mailpit.
		 */
		requireTLS: !secure && !localHosts.has(host),
		...(username != null && password != null ? { auth: { user: username, pass: password } } : undefined),
		/** The defaults are minutes, much longer than a user waits for a form to submit. */
		connectionTimeout: 10_000,
		greetingTimeout: 10_000,
		socketTimeout: 30_000,
		/** Mails contain user input, so attachments must not read local files or fetch urls. */
		disableFileAccess: true,
		disableUrlAccess: true,
	});

	return createMailer(transport, from);
}

export function createMailer(transport: Transporter, from: string): Mailer {
	return {
		async send(mail) {
			await transport.sendMail({ ...mail, from });
		},
	};
}
