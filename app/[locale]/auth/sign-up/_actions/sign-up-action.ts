"use server";

import { assert, getFormDataValues } from "@acdh-oeaw/lib";
import * as v from "valibot";

import { afterSignInUrl } from "@/config/app.config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { setSession } from "@/lib/auth";
import { createHashedPassword } from "@/lib/auth/password";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";

const SignUpActionInput = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.minLength(6), v.maxLength(255)),
	confirmation: v.string(), // FIXME:
});

type SignUpActionState = ActionState;

export async function signUpAction(
	previousState: SignUpActionState,
	formData: FormData,
): Promise<SignUpActionState> {
	const result = await v.safeParseAsync(SignUpActionInput, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionState("Incorrect email or password.");
	}

	const { email, password, username } = result.output;

	const passwordHash = await createHashedPassword(password);

	try {
		const [user] = await db
			.insert(users)
			.values({
				email,
				passwordHash,
				username,
			})
			.returning();

		assert(user);

		await setSession(user.id);
	} catch (error) {
		/**
		 * FIXME: @see https://github.com/drizzle-team/drizzle-orm/issues/376
		 */
		if (error instanceof Error && "code" in error && error.code === "23505") {
			return createErrorActionState("Email is already in use.");
		}

		return createErrorActionState("An unknown error occurred.");
	}

	redirect(afterSignInUrl);
}
