"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { AsteriskIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Label as AriaLabel, type LabelProps as AriaLabelProps } from "react-aria-components";

import { useFieldStatus } from "@/components/ui/field-status-context";

interface LabelProps extends AriaLabelProps {}

export function Label(props: LabelProps): ReactNode {
	const { children, className, ...rest } = props;

	const status = useFieldStatus();

	return (
		<AriaLabel
			{...rest}
			className={cn(
				"inline-flex gap-x-1 text-small text-text-strong group-disabled:text-text-disabled",
				className,
			)}
		>
			{children}
			{status?.isRequired ? (
				<AsteriskIcon className="size-3.5 shrink-0 self-start text-text-weak group-disabled:text-text-disabled" />
			) : null}
		</AriaLabel>
	);
}
