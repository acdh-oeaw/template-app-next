"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import * as v from "valibot";

import { afterSignInUrl } from "@/config/app.config";
import { setSession } from "@/lib/auth";
import { EmailInUseError } from "@/lib/errors";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";
import { signUpUser } from "@/lib/users";

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
	const result = await v.safeParseAsync(SignUpActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionState("Incorrect email or password.");
	}

	const { email, password } = result.output;

	try {
		const user = await signUpUser(email, password);

		await setSession(user.id);
	} catch (error) {
		if (error instanceof EmailInUseError) {
			return createErrorActionState("Email is already in use.");
		}

		return createErrorActionState("An unknown error occurred.");
	}

	redirect(afterSignInUrl);
}
