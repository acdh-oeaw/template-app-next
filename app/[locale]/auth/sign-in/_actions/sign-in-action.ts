"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { setSession } from "@/lib/auth";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";
import { signInUser } from "@/lib/users";

const SignInActionInputSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.nonEmpty()),
});

type SignInActionState = ActionState;

export async function signInAction(
	previousState: SignInActionState,
	formData: FormData,
): Promise<SignInActionState> {
	const result = await v.safeParseAsync(SignInActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionState("Incorrect email or password.");
	}

	const { email, password } = result.output;

	try {
		// TODO: ratelimit

		const user = await signInUser(email, password);

		await setSession(user.id);
	} catch {
		return createErrorActionState("Incorrect email or password.");
	}

	redirect(urls.afterSignIn);
}
