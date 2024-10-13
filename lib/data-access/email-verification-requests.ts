import crypto from "node:crypto";

import { eq } from "drizzle-orm";

import { verificationCodeLength, verificationCodeTTL } from "@/config/auth.config";
import { db } from "@/db";
import { type EmailVerificationRequest, emailVerificationRequests } from "@/db/schema";

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

export async function createEmailVerificationRequest(userId: string): Promise<string> {
	const code = await generateRandomToken(verificationCodeLength);
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
