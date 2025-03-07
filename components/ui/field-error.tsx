"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	FieldError as AriaFieldError,
	type FieldErrorProps as AriaFieldErrorProps,
} from "react-aria-components";

interface FieldErrorProps extends AriaFieldErrorProps {}

export function FieldError(props: FieldErrorProps): ReactNode {
	const { className, ...rest } = props;

	return (
		<AriaFieldError
			{...rest}
			className={cn("inline-flex gap-x-2 text-tiny font-strong text-text-error", className)}
		/>
	);
}
