"use server";

import { assert, getFormDataValues } from "@acdh-oeaw/lib";
import { hash } from "@node-rs/argon2";
import { cookies } from "next/headers";
import * as v from "valibot";

import { afterSignInUrl } from "@/config/app.config";
import { argonConfig } from "@/config/auth.config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { lucia } from "@/lib/auth/lucia";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";

const SignUpActionInput = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.minLength(6), v.maxLength(255)),
});

type SignUpActionState = ActionState;

export async function signUpAction(
	previousState: SignUpActionState,
	formData: FormData,
): Promise<SignUpActionState> {
	const result = await v.safeParseAsync(SignUpActionInput, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionState("Incorrect email or password");
	}

	const { email, password } = result.output;

	const passwordHash = await hash(password, argonConfig);

	try {
		const [user] = await db
			.insert(users)
			.values({
				email,
				passwordHash,
			})
			.returning();

		assert(user);

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	} catch (error) {
		/**
		 * FIXME: @see https://github.com/drizzle-team/drizzle-orm/issues/376
		 */
		if (error instanceof Error && "code" in error && error.code === "23505") {
			return createErrorActionState("Email is already in use.");
		}

		return createErrorActionState("An unknown error occurred");
	}

	return redirect(afterSignInUrl);
}
