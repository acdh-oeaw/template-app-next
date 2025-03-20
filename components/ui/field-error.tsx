"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	composeRenderProps,
	FieldError as AriaFieldError,
	type FieldErrorProps as AriaFieldErrorProps,
} from "react-aria-components";

interface FieldErrorProps extends AriaFieldErrorProps {}

export function FieldError(props: Readonly<FieldErrorProps>): ReactNode {
	const { className, ...rest } = props;

	return (
		<AriaFieldError
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"inline-flex gap-x-2 text-tiny font-strong text-text-error forced-colors:text-[Mark]",
					className,
				);
			})}
			data-slot="error"
		/>
	);
}
