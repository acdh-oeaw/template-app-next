"use client";

import type { ReactNode } from "react";
import { useFormState as useActionState } from "react-dom";

import { type ActionState, createInitialActionState } from "@/lib/form";

interface FormProps {
	action: (state: ActionState, formData: FormData) => Promise<ActionState>;
	children: ReactNode;
}

export function Form(props: FormProps): ReactNode {
	const { action, children } = props;

	const [state, formAction] = useActionState(action, createInitialActionState());

	return (
		<form action={formAction}>
			{children}

			<div aria-live="polite">
				{state.status === "error" ? (
					<div className="text-negative">{state.message}</div>
				) : state.status === "success" ? (
					<div className="text-positive">{state.message}</div>
				) : null}
			</div>
		</form>
	);
}
