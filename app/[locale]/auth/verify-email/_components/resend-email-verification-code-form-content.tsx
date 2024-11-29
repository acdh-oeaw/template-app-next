"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import { useFormState } from "react-dom";

import { resendEmailVerificationCodeAction } from "@/app/[locale]/auth/verify-email/_actions/resend-email-verification-code-action";
import { Form } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormStatus } from "@/components/ui/form-status";
import { createInitialActionState, getFieldErrors } from "@/lib/server/actions";
// import { Honeypot } from "@/lib/honeypot";

interface ResendEmailVerificationCodeFormContentProps {
	resendCodeLabel: string;
}

export function ResendEmailVerificationCodeFormContent(
	props: Readonly<ResendEmailVerificationCodeFormContentProps>,
): ReactNode {
	const { resendCodeLabel } = props;

	const [state, action] = useFormState(
		resendEmailVerificationCodeAction,
		createInitialActionState({}),
	);

	return (
		<Form action={action} className="grid gap-y-8" validationErrors={getFieldErrors(state)}>
			<FormStatus state={state} />

			{/* <Honeypot /> */}

			<div>
				<SubmitButton
					className={cn(
						"inline-flex min-h-12 items-center rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-5 py-2.5 text-small font-strong text-text-inverse-strong shadow-raised",
						"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
					)}
				>
					{resendCodeLabel}
				</SubmitButton>
			</div>
		</Form>
	);
}
