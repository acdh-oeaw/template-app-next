import { assert, createUrl, createUrlSearchParams } from "@acdh-oeaw/lib";

import { urls } from "@/config/auth.config";
import { env } from "@/config/env.config";
import type { User } from "@/db/schema";
import { createPasswordHash, verifyPassword } from "@/lib/auth/passwords";
import {
	createEmailVerificationRequest,
	deleteEmailVerificationRequest,
	getEmailVerificationRequest,
} from "@/lib/data-access/email-verification-requests";
import {
	createPasswordResetSession,
	deletePasswordResetSession,
	getPasswordResetSession,
} from "@/lib/data-access/password-reset-requests";
import { deleteSessionsByUser } from "@/lib/data-access/sessions";
import {
	createUser,
	getUserByEmail,
	setUserEmailVerified,
	updateUserPassword,
} from "@/lib/data-access/users";
import { EmailInUseError, InvalidVerificationCodeError, SignInError } from "@/lib/errors";
import { sendEmail } from "@/lib/send-email";

export async function signUpUser(email: string, password: string) {
	const existingUser = await getUserByEmail(email);

	if (existingUser != null) {
		throw new EmailInUseError();
	}

	const passwordHash = await createPasswordHash(password);

	const user = await createUser(email, passwordHash);
	assert(user);

	const code = await createEmailVerificationRequest(user.id);

	const url = createUrl({
		baseUrl: env.NEXT_PUBLIC_APP_BASE_URL,
		pathname: urls.verifyEmail,
		searchParams: createUrlSearchParams({ code }),
	});

	await sendEmail({
		to: email,
		subject: "Verify your email address.",
		html: `<a href="${String(url)}">Verify email address</a>`,
	});

	return user;
}

export async function signInUser(email: string, password: string): Promise<User> {
	const user = await getUserByEmail(email);

	if (user == null) {
		throw new SignInError();
	}

	const isValidPassword = await verifyPassword(user.passwordHash, password);

	if (!isValidPassword) {
		throw new SignInError();
	}

	return user;
}

export async function resetPassword(email: string): Promise<void> {
	const user = await getUserByEmail(email);

	if (user == null) {
		return; // FIXME: throw?
	}

	const code = await createPasswordResetSession(user.id);

	const url = createUrl({
		baseUrl: env.NEXT_PUBLIC_APP_BASE_URL,
		pathname: urls.changePassword,
		searchParams: createUrlSearchParams({ code }),
	});

	await sendEmail({
		to: email,
		subject: "Your password reset link.",
		html: `<a href="${String(url)}">Reset password</a>`,
	});
}

export async function changePassword(code: string, password: string): Promise<void> {
	const session = await getPasswordResetSession(code);

	if (session == null) {
		throw new InvalidVerificationCodeError();
	}

	const userId = session.userId;

	const passwordHash = await createPasswordHash(password);

	// FIXME: wrap in transaction
	await deletePasswordResetSession(code);
	await updateUserPassword(userId, passwordHash);
	await deleteSessionsByUser(userId);
}

export async function verifyEmail(code: string): Promise<void> {
	const request = await getEmailVerificationRequest(code);

	if (request == null) {
		throw new InvalidVerificationCodeError();
	}

	const userId = request.userId;

	// FIXME: wrap in transaction
	await deleteEmailVerificationRequest(code);
	await setUserEmailVerified(userId);
}
