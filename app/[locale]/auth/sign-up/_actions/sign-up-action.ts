"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { headers } from "next/headers";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { setSession } from "@/lib/auth";
import { EmailInUseError } from "@/lib/errors";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";
import { globalPOSTRateLimit } from "@/lib/rate-limit";
import { RefillingTokenBucket } from "@/lib/rate-limit/bucket";
import { signUpUser } from "@/lib/users";

const ipBucket = new RefillingTokenBucket<string>(3, 10);

const SignUpActionInputSchema = v.pipe(
	v.object({
		email: v.pipe(v.string(), v.email()),
		password: v.pipe(v.string(), v.minLength(6), v.maxLength(255)),
		confirmation: v.pipe(v.string(), v.nonEmpty()),
	}),
	v.forward(
		v.check((input) => {
			return input.confirmation === input.password;
		}, "Passwords don't match."),
		["confirmation"],
	),
);

type SignUpActionState = ActionState;

export async function signUpAction(
	previousState: SignUpActionState,
	formData: FormData,
): Promise<SignUpActionState> {
	if (!globalPOSTRateLimit()) {
		return createErrorActionState("Too many requests");
	}

	// TODO: Assumes X-Forwarded-For is always included.
	const clientIP = headers().get("X-Forwarded-For");
	if (clientIP != null && !ipBucket.check(clientIP, 1)) {
		return createErrorActionState("Too many requests");
	}

	const result = await v.safeParseAsync(SignUpActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionState("Incorrect email or password.");
	}

	const { email, password } = result.output;

	try {
		// const emailAvailable = checkEmailAvailability(email);
		// if (!emailAvailable) {
		// 	return createErrorActionState"Email is already used");
		// }

		// const strongPassword = await verifyPasswordStrength(password);
		// if (!strongPassword) {
		// 	return createErrorActionState("Weak password");
		// }

		// if (clientIP != null && !ipBucket.consume(clientIP, 1)) {
		// 	return createErrorActionState("Too many requests");
		// }

		//

		const user = await signUpUser(email, password);
		setEmailVerificationRequestCookie(emailVerificationRequest);

		await setSession(user.id);

		//

		// const sessionToken = generateSessionToken();
		// const session = createSession(sessionToken, user.id, { twoFactorVerified: false });
		// setSessionTokenCookie(sessionToken, session.expiresAt);
		// redirect("/auth/2fa/setup");
	} catch (error) {
		if (error instanceof EmailInUseError) {
			return createErrorActionState("Email is already in use.");
		}

		return createErrorActionState("An unknown error occurred.");
	}

	redirect(urls.afterSignIn);
}
