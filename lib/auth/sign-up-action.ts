"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { hash } from "@node-rs/argon2";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import * as v from "valibot";

import { db } from "@/db";
import { users } from "@/db/schema";
import { argonConfig } from "@/lib/auth/auth.config";
import { lucia } from "@/lib/auth/lucia";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";

const SignUpActionInput = v.object({
	username: v.pipe(v.string(), v.minLength(4), v.maxLength(31), v.regex(/^[a-z0-9_-]+$/)),
	password: v.pipe(v.string(), v.minLength(6), v.maxLength(255)),
});

type SignUpActionState = ActionState;

export async function signUpAction(
	previousState: SignUpActionState,
	formData: FormData,
): Promise<SignUpActionState> {
	const result = await v.safeParseAsync(SignUpActionInput, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionState("Incorrect username or password");
	}

	const { password, username } = result.output;

	const passwordHash = await hash(password, argonConfig);

	const userId = generateId(15);

	try {
		await db.insert(users).values({
			id: userId,
			username,
			passwordHash,
		});

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "23505") {
			return createErrorActionState("Username already used");
		}

		return createErrorActionState("An unknown error occurred");
	}

	return redirect("/");
}
