import { cn } from "@acdh-oeaw/style-variants";
import type { ComponentPropsWithRef, ReactNode } from "react";

import { FormErrorMessage } from "@/components/form-error-message";

interface FormErrorProps extends ComponentPropsWithRef<typeof FormErrorMessage> {}

export function FormError(props: Readonly<FormErrorProps>): ReactNode {
	const { className, ...rest } = props;

	return (
		<FormErrorMessage
			{...rest}
			className={cn(
				"min-h-12 rounded-2 border border-stroke-error-weak bg-fill-error-weak px-4 py-2.5 text-small font-strong text-text-error",
				className,
			)}
		/>
	);
}
