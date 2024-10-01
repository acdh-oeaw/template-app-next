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

	return <form action={formAction}>{children}</form>;
}
