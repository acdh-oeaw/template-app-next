"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { headers } from "next/headers";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { setSession } from "@/lib/auth";
import { isVerified } from "@/lib/auth/is-verified";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";
import { globalPOSTRateLimit } from "@/lib/rate-limit";
import { RefillingTokenBucket, Throttler } from "@/lib/rate-limit/bucket";
import { signInUser } from "@/lib/users";

const _throttler = new Throttler<string>([1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

const SignInActionInputSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.nonEmpty()),
});

type SignInActionState = ActionState;

export async function signInAction(
	previousState: SignInActionState,
	formData: FormData,
): Promise<SignInActionState> {
	if (!globalPOSTRateLimit()) {
		return createErrorActionState("Too many requests");
	}

	// TODO: Assumes X-Forwarded-For is always included.
	const clientIP = headers().get("X-Forwarded-For");
	if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
		return createErrorActionState("Too many requests");
	}

	const result = await v.safeParseAsync(SignInActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionState("Invalid email or password.");
	}

	const { email, password } = result.output;

	// FIXME: use `unstable_rethrow` from next
	let user: Awaited<ReturnType<typeof signInUser>>;

	try {
		user = await signInUser(email, password);

		// lucia docs add this rate limiter after checking if user exists, and before checking password
		// if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		// 	return createErrorActionState("Too many requests");
		// }
		// if (!throttler.consume(user.id)) {
		// 	return createErrorActionState("Too many requests");
		// }
		// ... check password ...
		// throttler.reset(user.id);

		await setSession(user.id, { twoFactorVerified: false });
	} catch {
		return createErrorActionState("Incorrect email or password.");
	}

	if (!isVerified(user.emailVerified)) {
		redirect(urls.verifyEmail);
	}

	// if (!user.registered2FA) {
	// 	redirect(urls.2faSetup);
	// }

	// redirect(urls.2fa);
	redirect(urls.afterSignIn);
}
