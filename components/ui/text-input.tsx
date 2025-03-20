"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	composeRenderProps,
	TextField as AriaTextField,
	type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { FieldStatusContext } from "@/components/ui/field-status-context";

interface TextInputProps extends AriaTextFieldProps {}

export function TextInput(props: Readonly<TextInputProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaTextField
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn("group grid content-start gap-y-1", className);
			})}
			data-slot="field"
		>
			{composeRenderProps(children, (children, renderProps) => {
				return <FieldStatusContext value={renderProps}>{children}</FieldStatusContext>;
			})}
		</AriaTextField>
	);
}
