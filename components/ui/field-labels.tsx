import { cn } from "@acdh-oeaw/style-variants";
import type { ComponentPropsWithRef, ReactNode } from "react";

interface FieldLabelsProps extends ComponentPropsWithRef<"div"> {}

export function FieldLabels(props: Readonly<FieldLabelsProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<div {...rest} className={cn("grid content-start slot-error:mt-1", className)}>
			{children}
		</div>
	);
}
