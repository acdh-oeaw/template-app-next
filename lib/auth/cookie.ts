import "server-only";

import { cookies } from "next/headers";

import { env } from "@/config/env.config";

const SESSION_COOKIE_NAME = "session";

export function getSessionToken(): string | undefined {
	return cookies().get(SESSION_COOKIE_NAME)?.value;
}

export function setSessionTokenCookie(token: string, expiresAt: Date): void {
	cookies().set(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		expires: expiresAt,
		path: "/",
	});
}

export function deleteSessionTokenCookie(): void {
	cookies().set(SESSION_COOKIE_NAME, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}
