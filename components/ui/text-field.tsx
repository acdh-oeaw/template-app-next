"use client";

import type { ReactNode } from "react";
import {
	TextField as AriaTextField,
	type TextFieldProps as AriaTextFieldProps,
	Input as AriaInput,
	Label as AriaLabel,
	FieldError as AriaFieldError,
} from "react-aria-components";

interface TextFieldProps extends AriaTextFieldProps {
	label: ReactNode;
}

export function TextField(props: TextFieldProps): ReactNode {
	const { label, ...rest } = props;

	return (
		<AriaTextField {...rest}>
			<AriaLabel>{label}</AriaLabel>
			<AriaInput />
			<AriaFieldError />
		</AriaTextField>
	);
}
