import { eq } from "drizzle-orm";

import { verificationCodeLength, verificationCodeTTL } from "@/config/auth.config";
import { db } from "@/db";
import { type EmailVerificationRequest, emailVerificationRequests } from "@/db/schema";
import { generateToken } from "@/lib/auth/tokens";

export async function createEmailVerificationRequest(userId: string): Promise<string> {
	const code = generateToken(verificationCodeLength);
	const expiresAt = new Date(Date.now() + verificationCodeTTL);

	await db
		.insert(emailVerificationRequests)
		.values({
			userId,
			code,
			expiresAt,
		})
		.onConflictDoUpdate({
			target: emailVerificationRequests.id,
			set: {
				code,
				expiresAt,
			},
		});

	return code;
}

export async function getEmailVerificationRequest(
	code: string,
): Promise<EmailVerificationRequest | undefined> {
	const request = await db.query.emailVerificationRequests.findFirst({
		where: eq(emailVerificationRequests.code, code),
	});

	return request;
}

export async function deleteEmailVerificationRequest(code: string): Promise<void> {
	await db.delete(emailVerificationRequests).where(eq(emailVerificationRequests.code, code));
}
