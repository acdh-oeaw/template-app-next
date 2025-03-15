"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import { Label as AriaLabel, type LabelProps as AriaLabelProps } from "react-aria-components";

import { useFieldStatus } from "@/components/ui/field-status-context";
import { RequiredIndicator } from "@/components/ui/required-indicator";

interface LabelProps extends AriaLabelProps {}

export function Label(props: LabelProps): ReactNode {
	const { children, className, ...rest } = props;

	const status = useFieldStatus();

	return (
		<AriaLabel
			{...rest}
			className={cn(
				"inline-flex cursor-default gap-x-1 text-small text-text-strong group-disabled:text-text-disabled",
				className,
			)}
			data-slot="label"
		>
			{children}
			{status?.isRequired ? <RequiredIndicator /> : null}
		</AriaLabel>
	);
}
