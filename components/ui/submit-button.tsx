"use client";

import type { ComponentPropsWithRef, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps extends Omit<
	ComponentPropsWithRef<typeof Button>,
	"isPending" | "type"
> {}

export function SubmitButton(props: Readonly<SubmitButtonProps>): ReactNode {
	const { children, ...rest } = props;

	const { pending: isPending } = useFormStatus();

	return (
		<Button {...rest} isPending={isPending} type="submit">
			{children}
		</Button>
	);
}
