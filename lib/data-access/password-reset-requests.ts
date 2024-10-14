import { eq } from "drizzle-orm";

import { verificationCodeLength, verificationCodeTTL } from "@/config/auth.config";
import { db } from "@/db";
import { type PasswordResetSession, passwordResetSessions } from "@/db/schema";
import { generateToken } from "@/lib/auth/tokens";

export async function createPasswordResetSession(userId: string): Promise<string> {
	const code = generateToken(verificationCodeLength);
	const expiresAt = new Date(Date.now() + verificationCodeTTL);

	await db
		.insert(passwordResetSessions)
		.values({
			userId,
			code,
			expiresAt,
		})
		.onConflictDoUpdate({
			target: passwordResetSessions.id,
			set: {
				code,
				expiresAt,
			},
		});

	return code;
}

export async function getPasswordResetSession(
	code: string,
): Promise<PasswordResetSession | undefined> {
	const request = await db.query.passwordResetSessions.findFirst({
		where: eq(passwordResetSessions.code, code),
	});

	return request;
}

export async function deletePasswordResetSession(code: string): Promise<void> {
	await db.delete(passwordResetSessions).where(eq(passwordResetSessions.code, code));
}
