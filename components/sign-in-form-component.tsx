"use client";

import type { ReactNode } from "react";
import { useFormState } from "react-dom";

import { SubmitButton } from "@/components/submit-button";
import { signIn } from "@/lib/actions/auth";

interface SignInFormComponentProps {
	callbackUrl?: string | undefined;
	emailLabel: string;
	passwordLabel: string;
	signInLabel: string;
}

export function SignInFormComponent(props: SignInFormComponentProps): ReactNode {
	const { callbackUrl, emailLabel, passwordLabel, signInLabel } = props;

	const [signInState, signInAction] = useFormState(signIn, { status: "initial" });

	return (
		<form action={signInAction}>
			{/*
			 * TODO: Check if next.js handles csrf for us.
			 * Getting a token from `/api/auth/csrf` and providing it via hidden input
			 * currently does nothing, i.e. providing an invalid token works as well.
			 */}
			{/* <input name="csrfToken" type="hidden" value={csrfToken} /> */}

			<input name="redirectTo" type="hidden" value={callbackUrl} />

			<label>
				<span>{emailLabel}</span>
				<input name="email" placeholder={emailLabel} type="email" />
			</label>

			<label>
				<span>{passwordLabel}</span>
				<input name="password" placeholder={passwordLabel} type="password" />
			</label>

			<SubmitButton>{signInLabel}</SubmitButton>

			<div aria-atomic={true} aria-live="polite">
				{signInState.status === "error" ? signInState.message : null}
			</div>
		</form>
	);
}
