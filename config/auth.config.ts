import type { Options } from "@node-rs/argon2";

export const argonConfig: Options = {
	memoryCost: 19456,
	outputLen: 32,
	parallelism: 1,
	timeCost: 2,
};

export const sessionCookieName = "session";

export const sessionMaxDurationMs = 1000 * 60 * 60 * 24 * 30; /** 30 days. */
export const sessionRefreshIntervalMs = sessionMaxDurationMs / 2;

export const tokenCodeLength = 20; /** Bytes. */
export const tokenCodeTTL = 1000 * 60 * 5; /** 5 min. */

// OTP: 5 bytes
// recovery code: 10 bytes

export const urls = {
	// "2fa": "/auth/2fa",
	// "2faSetup": "/auth/2fa/setup",
	afterSignIn: "/",
	afterVerifyEmail: "/auth/verify-success",
	changePassword: "/auth/change-password",
	forgotPassword: "/auth/forgot-password",
	signIn: "/auth/sign-in",
	signUp: "/auth/sign-up",
	verifyEmail: "/auth/verify-email",
};
