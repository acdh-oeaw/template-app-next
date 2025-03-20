"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import { Text as AriaText, type TextProps as AriaTextProps } from "react-aria-components";

interface FieldDescriptionProps extends AriaTextProps {}

export function FieldDescription(props: Readonly<FieldDescriptionProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaText
			{...rest}
			className={cn("text-tiny text-text-weak group-disabled:text-text-disabled", className)}
			slot="description"
		>
			{children}
		</AriaText>
	);
}
