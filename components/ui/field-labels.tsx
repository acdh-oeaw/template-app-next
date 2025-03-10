import { cn } from "@acdh-oeaw/style-variants";
import type { ComponentPropsWithRef, ReactNode } from "react";

interface FieldLabelsProps extends ComponentPropsWithRef<"div"> {}

export function FieldLabels(props: FieldLabelsProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<div {...rest} className={cn("*:data-[slot=error]:mt-1", className)}>
			{children}
		</div>
	);
}
