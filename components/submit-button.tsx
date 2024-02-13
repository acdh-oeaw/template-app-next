"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
	children: ReactNode;
	isDisabled?: boolean;
}

export function SubmitButton(props: SubmitButtonProps): ReactNode {
	const { children, isDisabled } = props;

	const { pending: isPending } = useFormStatus();

	return (
		<button aria-disabled={isDisabled === true || isPending} type="submit">
			{children}
		</button>
	);
}
