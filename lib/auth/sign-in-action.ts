"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import * as v from "valibot";

import { auth } from "@/lib/auth";
import { argonConfig } from "@/lib/auth/auth.config";
import { db } from "@/lib/db";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";

const SignInActionInput = v.object({
	username: v.pipe(v.string(), v.nonEmpty()),
	password: v.pipe(v.string(), v.nonEmpty()),
});

type SignInActionState = ActionState;

export async function signInAction(
	previousState: SignInActionState,
	formData: FormData,
): Promise<SignInActionState> {
	const result = await v.safeParseAsync(SignInActionInput, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionState("Incorrect username or password");
	}

	const { password, username } = result.output;

	const existingUser = db.prepare("SELECT * FROM user WHERE username = ?").get(username);

	if (!existingUser) {
		return createErrorActionState("Incorrect username or password");
	}

	const validPassword = await verify(existingUser.password_hash, password, argonConfig);

	if (!validPassword) {
		// NOTE:
		// Returning immediately allows malicious actors to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, you may want to hash passwords even for invalid usernames.
		// However, valid usernames can be already be revealed with the signup page among other methods.
		// It will also be much more resource intensive.
		// Since protecting against this is non-trivial,
		// it is crucial your implementation is protected against brute-force attacks with login throttling, 2FA, etc.
		// If usernames are public, you can outright tell the user that the username is invalid.
		return createErrorActionState("Incorrect username or password");
	}

	const session = await auth.createSession(existingUser.id, {});
	const sessionCookie = auth.createSessionCookie(session.id);
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

	return redirect("/");
}
