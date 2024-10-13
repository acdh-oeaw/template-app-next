import crypto from "node:crypto";

import { eq } from "drizzle-orm";

import { verificationCodeLength, verificationCodeTTL } from "@/config/auth.config";
import { db } from "@/db";
import { type PasswordResetSession, passwordResetSessions } from "@/db/schema";

async function generateRandomToken(length: number): Promise<string> {
	const buf = await new Promise<Buffer>((resolve, reject) => {
		crypto.randomBytes(Math.ceil(length / 2), (err, buf) => {
			if (err !== null) {
				reject(err);
			} else {
				resolve(buf);
			}
		});
	});

	return buf.toString("hex").slice(0, length);
}

export async function createPasswordResetSession(userId: string): Promise<string> {
	const code = await generateRandomToken(verificationCodeLength);
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
