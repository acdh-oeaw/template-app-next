import { cookies } from "next/headers";

import { passwordResetCookieName } from "@/config/auth.config";
import { env } from "@/config/env.config";

export async function getPasswordResetSessionToken(): Promise<string | null> {
	return (await cookies()).get(passwordResetCookieName)?.value ?? null;
}

export async function setPasswordResetSessionTokenCookie(
	token: string,
	expiresAt: Date,
): Promise<void> {
	(await cookies()).set(passwordResetCookieName, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		expires: expiresAt,
		path: "/",
	});
}

export async function deletePasswordResetSessionTokenCookie(): Promise<void> {
	(await cookies()).set(passwordResetCookieName, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}
