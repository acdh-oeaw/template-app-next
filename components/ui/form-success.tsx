import { cn } from "@acdh-oeaw/style-variants";
import type { ComponentPropsWithRef, ReactNode } from "react";

import { FormSuccessMessage } from "@/components/form-success-message";

interface FormSuccessProps extends ComponentPropsWithRef<typeof FormSuccessMessage> {}

export function FormSuccess(props: Readonly<FormSuccessProps>): ReactNode {
	const { className, ...rest } = props;

	return (
		<FormSuccessMessage
			{...rest}
			className={cn(
				"min-h-12 rounded-2 border border-stroke-success-weak bg-fill-success-weak px-4 py-2.5 text-small font-strong text-text-success",
				className,
			)}
		/>
	);
}
