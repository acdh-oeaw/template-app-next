import "server-only";

import { cache } from "react";

import type { User } from "@/db/schema";
import { getSessionToken, setSessionTokenCookie } from "@/lib/auth/cookies";
import {
	createSession,
	generateSessionToken,
	type SessionFlags,
	type SessionValidationResult,
	validateSessionToken,
} from "@/lib/auth/sessions";
import { AuthenticationError } from "@/lib/errors";

export const getCurrentSession = cache(
	async function getCurrentSession(): Promise<SessionValidationResult> {
		const token = await getSessionToken();

		if (token == null) {
			return { session: null, user: null };
		}

		return validateSessionToken(token);
	},
);

export async function getCurrentUser(): Promise<User | null> {
	const { user } = await getCurrentSession();

	return user;
}

export async function assertAuthenticated(): Promise<User> {
	const user = await getCurrentUser();

	if (user == null) {
		throw new AuthenticationError();
	}

	return user;
}

export async function setSession(userId: string, sessionFlags: SessionFlags): Promise<void> {
	const token = generateSessionToken();
	const session = await createSession(token, userId, sessionFlags);
	await setSessionTokenCookie(token, session.expiresAt);
}
