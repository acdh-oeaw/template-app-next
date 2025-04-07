"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	composeRenderProps,
	TextArea as AriaTextArea,
	type TextAreaProps as AriaTextAreaProps,
} from "react-aria-components";

interface TextAreaProps extends AriaTextAreaProps {}

export function TextArea(props: Readonly<TextAreaProps>): ReactNode {
	const { className, ...rest } = props;

	return (
		<AriaTextArea
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"min-h-12 rounded-2 border border-stroke-strong bg-fill-inverse-strong px-4 py-3 text-small text-text-strong transition placeholder:text-text-weak invalid:border-2 invalid:border-stroke-error-strong invalid:bg-fill-error-weak hover:bg-fill-inverse-strong-hover focus-visible:focus-outline disabled:border-stroke-disabled disabled:text-text-disabled forced-colors:border-[ButtonBorder] forced-colors:invalid:border-[Mark] forced-colors:focus:border-[Highlight] forced-colors:disabled:border-[GrayText] pressed:bg-fill-inverse-strong-press",
					className,
				);
			})}
			data-slot="control"
		/>
	);
}
