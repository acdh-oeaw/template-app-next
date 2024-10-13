"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import * as v from "valibot";

import { type ActionState, createErrorActionState } from "@/lib/form";
import { resetPassword } from "@/lib/users";

const ResetPasswordActionInputSchema = v.object({
	email: v.pipe(v.string(), v.email()),
});

type ResetPasswordActionState = ActionState;

export async function resetPasswordAction(
	previousState: ResetPasswordActionState,
	formData: FormData,
): Promise<ResetPasswordActionState> {
	const result = await v.safeParseAsync(
		ResetPasswordActionInputSchema,
		getFormDataValues(formData),
	);

	if (!result.success) {
		return createErrorActionState("Incorrect email.");
	}

	const { email } = result.output;

	// TODO: ratelimit

	await resetPassword(email);
}
