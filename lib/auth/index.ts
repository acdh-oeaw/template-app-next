import "server-only";

import { cache } from "react";

import type { User } from "@/db/schema";
import { setSessionTokenCookie } from "@/lib/auth/cookie";
import { createSession, generateSessionToken, validateRequest } from "@/lib/auth/session";
import { AuthenticationError } from "@/lib/errors";

export const getCurrentUser = cache(async function getCurrentUser(): Promise<User | null> {
	const { user } = await validateRequest();

	return user;
});

export async function assertAuthenticated(): Promise<User> {
	const user = await getCurrentUser();

	if (user == null) {
		throw new AuthenticationError();
	}

	return user;
}

export async function setSession(userId: string): Promise<void> {
	const token = generateSessionToken();
	const session = await createSession(token, userId);
	setSessionTokenCookie(token, session.expiresAt);
}
