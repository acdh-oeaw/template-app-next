import { eq } from "drizzle-orm";

import { tokenCodeLength, tokenCodeTTL } from "@/config/auth.config";
import { db } from "@/db";
import { type EmailVerificationRequest, emailVerificationRequests } from "@/db/schema";
import { generateToken } from "@/lib/auth/tokens";

export async function createEmailVerificationRequest(
	userId: string,
): Promise<EmailVerificationRequest | undefined> {
	const code = generateToken(tokenCodeLength);
	const expiresAt = new Date(Date.now() + tokenCodeTTL);

	const [request] = await db
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
		})
		.returning();

	return request;
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
