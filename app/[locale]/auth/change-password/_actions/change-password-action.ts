"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import * as v from "valibot";

import { type ActionState, createErrorActionState } from "@/lib/form";
import { changePassword } from "@/lib/users";

const ChangePasswordActionInputSchema = v.pipe(
	v.object({
		code: v.pipe(v.string(), v.nonEmpty()),
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

type ChangePasswordActionState = ActionState;

export async function changePasswordAction(
	previousState: ChangePasswordActionState,
	formData: FormData,
): Promise<ChangePasswordActionState> {
	const result = await v.safeParseAsync(
		ChangePasswordActionInputSchema,
		getFormDataValues(formData),
	);

	if (!result.success) {
		return createErrorActionState("Invalid input.");
	}

	const { code, password } = result.output;

	// TODO: ratelimit

	await changePassword(code, password);
}
