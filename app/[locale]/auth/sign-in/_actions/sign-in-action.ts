"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { eq } from "drizzle-orm";
import * as v from "valibot";

import { afterSignInUrl } from "@/config/app.config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { setSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth/password";
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
		return createErrorActionState("Incorrect email or password.");
	}

	const { email, password } = result.output;

	const existingUser = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (!existingUser) {
		return createErrorActionState("Incorrect email or password.");
	}

	const validPassword = await verifyPassword(existingUser.passwordHash, password);

	if (!validPassword) {
		return createErrorActionState("Incorrect email or password.");
	}

	await setSession(existingUser.id);

	redirect(afterSignInUrl);
}
