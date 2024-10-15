import "server-only";

import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { eq } from "drizzle-orm";

import { sessionMaxDurationMs, sessionRefreshIntervalMs } from "@/config/auth.config";
import { db } from "@/db";
import { type Session, sessions, type User, users } from "@/db/schema";
import { getSessionToken } from "@/lib/auth/cookies";
import { generateToken } from "@/lib/auth/tokens";

function generateSessionId(token: string) {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export function generateSessionToken(): string {
	return generateToken(20);
}

// type SessionFlags = Pick<Session, "twoFactorVerified">;

export async function createSession(
	token: string,
	userId: string,
	// flags: SessionFlags,
): Promise<Session> {
	const sessionId = generateSessionId(token);

	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + sessionMaxDurationMs),
		// twoFactorVerified: flags.twoFactorVerified,
	};

	// TODO: move to data-access folder
	await db.insert(sessions).values(session);

	return session;
}

// export async function setSessionAs2FAVerified(sessionId: string): Promise<void> {
// 	await db
// 		.update(sessions)
// 		.set({
// 			twoFactorVerified: new Date(),
// 		})
// 		.where(eq(sessions.id, sessionId));
// }

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = generateSessionId(token);

	// TODO: move to data-access folder
	const [result] = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId));

	if (result == null) {
		return { session: null, user: null };
	}

	const { user, session } = result;

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, session.id)); // TODO: move to data-access folder

		return { session: null, user: null };
	}

	if (Date.now() >= session.expiresAt.getTime() - sessionRefreshIntervalMs) {
		session.expiresAt = new Date(Date.now() + sessionMaxDurationMs);

		// TODO: move to data-access folder
		await db
			.update(sessions)
			.set({
				expiresAt: session.expiresAt,
			})
			.where(eq(sessions.id, session.id));
	}

	return { session, user };
}

export async function getCurrentSession(): Promise<SessionValidationResult> {
	const sessionToken = await getSessionToken();

	if (sessionToken == null) {
		return { session: null, user: null };
	}

	return validateSessionToken(sessionToken);
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId)); // TODO: move to data-access folder
}

export async function invalidateUserSessions(userId: string): Promise<void> {
	await db.delete(sessions).where(eq(users.id, userId)); // TODO: move to data-access folder
}
