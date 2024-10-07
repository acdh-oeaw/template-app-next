"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import * as v from "valibot";

import { afterSignInUrl } from "@/config/app.config";
import { argonConfig } from "@/config/auth.config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { lucia } from "@/lib/auth/lucia";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";

const SignInActionInput = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.nonEmpty()),
});

type SignInActionState = ActionState;

export async function signInAction(
	previousState: SignInActionState,
	formData: FormData,
): Promise<SignInActionState> {
	const result = await v.safeParseAsync(SignInActionInput, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionState("Incorrect email or password");
	}

	const { email, password } = result.output;

	const existingUser = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (!existingUser) {
		return createErrorActionState("Incorrect email or password");
	}

	const validPassword = await verify(existingUser.passwordHash, password, argonConfig);

	if (!validPassword) {
		return createErrorActionState("Incorrect email or password");
	}

	const session = await lucia.createSession(existingUser.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

	return redirect(afterSignInUrl);
}
