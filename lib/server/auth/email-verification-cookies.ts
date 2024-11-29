import { cookies } from "next/headers";

import { emailVerificationRequestCookieName } from "@/config/auth.config";
import { env } from "@/config/env.config";
import type { EmailVerificationRequest } from "@/lib/server/auth/email-verification-requests";

export async function getEmailVerificationRequestId(): Promise<string | null> {
	return (await cookies()).get(emailVerificationRequestCookieName)?.value ?? null;
}

export async function setEmailVerificationRequestCookie(
	request: EmailVerificationRequest,
): Promise<void> {
	(await cookies()).set(emailVerificationRequestCookieName, request.id, {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		expires: request.expiresAt,
		path: "/",
	});
}

export async function deleteEmailVerificationRequestCookie(): Promise<void> {
	(await cookies()).set(emailVerificationRequestCookieName, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}
