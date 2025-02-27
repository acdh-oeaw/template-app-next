// eslint-disable-next-line check-file/folder-naming-convention
"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import { FieldError, Input, Label, TextField } from "react-aria-components";
import { useFormState } from "react-dom";

import { verifyPasswordReset2faWithRecoveryCodeAction } from "@/app/[locale]/auth/reset-password/2fa/_actions/verify-password-reset-2fa-with-recovery-code-action";
import { Form } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormStatus } from "@/components/ui/form-status";
import { createInitialActionState, getFieldErrors } from "@/lib/server/actions";

interface PasswordResetRecoveryCodeFormContentProps {
	recoveryCodeLabel: string;
	submitLabel: string;
}

export function PasswordResetRecoveryCodeFormContent(
	props: Readonly<PasswordResetRecoveryCodeFormContentProps>,
): ReactNode {
	const { recoveryCodeLabel, submitLabel } = props;

	const [state, action] = useFormState(
		verifyPasswordReset2faWithRecoveryCodeAction,
		createInitialActionState({}),
	);

	return (
		<Form action={action} className="grid gap-y-8" validationErrors={getFieldErrors(state)}>
			<FormStatus state={state} />

			{/* <Honeypot /> */}

			<TextField className="grid gap-y-1" isRequired={true} name="code">
				<Label className="text-small text-text-strong">{recoveryCodeLabel}</Label>
				<FieldError className="text-small text-text-error" />
				<Input
					className={cn(
						"min-h-12 rounded-2 border border-stroke-strong bg-fill-inverse-strong px-4 py-2.5 text-small text-text-strong",
						"interactive focus:focus-outline hover:hover-overlay pressed:press-overlay",
						"invalid:border-stroke-error-strong invalid:bg-fill-error-weak",
					)}
				/>
			</TextField>

			<div>
				<SubmitButton
					className={cn(
						"inline-flex min-h-12 items-center rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-5 py-2.5 text-small font-strong text-text-inverse-strong shadow-raised",
						"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
					)}
				>
					{submitLabel}
				</SubmitButton>
			</div>
		</Form>
	);
}
