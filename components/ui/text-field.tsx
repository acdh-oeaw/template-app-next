"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { type ReactNode, useMemo } from "react";
import {
	TextField as AriaTextField,
	type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { FieldStatusContext } from "@/components/ui/field-status-context";

interface TextFieldProps extends AriaTextFieldProps {}

export function TextField(props: TextFieldProps): ReactNode {
	const { children, className, ...rest } = props;

	const isRequired = Boolean(rest.isRequired);

	const value = useMemo(() => {
		const value = {
			isRequired,
		};

		return value;
	}, [isRequired]);

	return (
		<FieldStatusContext.Provider value={value}>
			<AriaTextField {...rest} className={cn("group grid gap-y-1", className)}>
				{children}
			</AriaTextField>
		</FieldStatusContext.Provider>
	);
}

// TODO:
// - className can be function
// - children can be function
// - avoid -mt-1
// - pass isRequired and isDisabled to label and description
