"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import { useFormState } from "react-dom";

import { regenerateRecoveryCodeAction } from "@/app/[locale]/auth/settings/_actions/regenerate-recovery-code-action";
import { Form } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormStatus } from "@/components/ui/form-status";
import { createInitialActionState, getFieldErrors } from "@/lib/server/actions";
// import { Honeypot } from "@/lib/honeypot";

interface RecoveryCodeFormContentProps {
	generateNewCodeLabel: string;
	recoveryCode: string;
	yourCodeLabel: string;
}

export function RecoveryCodeFormContent(props: Readonly<RecoveryCodeFormContentProps>): ReactNode {
	const { generateNewCodeLabel, recoveryCode, yourCodeLabel } = props;

	const [state, action] = useFormState(regenerateRecoveryCodeAction, createInitialActionState({}));

	const newRecoveryCode =
		state.status === "success"
			? ((state.formData?.get("recovery-code") as string | null) ?? null)
			: null;

	return (
		<Form action={action} className="grid gap-y-8" validationErrors={getFieldErrors(state)}>
			<FormStatus state={state} />

			{/* <Honeypot /> */}

			<p>
				{yourCodeLabel} {newRecoveryCode ?? recoveryCode}
			</p>

			<div>
				<SubmitButton
					className={cn(
						"inline-flex min-h-12 items-center rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-5 py-2.5 text-small font-strong text-text-inverse-strong shadow-raised",
						"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
					)}
				>
					{generateNewCodeLabel}
				</SubmitButton>
			</div>
		</Form>
	);
}
