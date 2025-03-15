"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	composeRenderProps,
	Input as AriaInput,
	type InputProps as AriaInputProps,
} from "react-aria-components";

interface InputProps extends AriaInputProps {}

export function Input(props: InputProps): ReactNode {
	const { className, ...rest } = props;

	return (
		<AriaInput
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"interactive min-h-12 rounded-2 border border-stroke-strong bg-fill-inverse-strong px-4 text-small text-text-strong transition placeholder:text-text-weak invalid:border-2 invalid:border-stroke-error-strong invalid:bg-fill-error-weak hover:hover-overlay focus-visible:focus-outline disabled:border-stroke-disabled disabled:text-text-disabled forced-colors:border-[ButtonBorder] forced-colors:invalid:border-[Mark] forced-colors:focus:border-[Highlight] forced-colors:disabled:border-[GrayText] pressed:press-overlay",
					className,
				);
			})}
			data-slot="control"
		/>
	);
}
