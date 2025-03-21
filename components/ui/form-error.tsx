import { cn } from "@acdh-oeaw/style-variants";
import { OctagonXIcon } from "lucide-react";
import { type ComponentPropsWithRef, Fragment, type ReactNode } from "react";

import { FormErrorMessage } from "@/components/form-error-message";

interface FormErrorProps extends ComponentPropsWithRef<typeof FormErrorMessage> {}

export function FormError(props: Readonly<FormErrorProps>): ReactNode {
	const { className, ...rest } = props;

	return (
		<FormErrorMessage
			{...rest}
			className={cn(
				"flex min-h-12 items-center gap-x-2 rounded-2 border border-stroke-error-weak bg-fill-error-weak px-4 py-2.5 text-small font-strong text-text-error",
				className,
			)}
		>
			{(state) => {
				return (
					<Fragment>
						<OctagonXIcon
							aria-hidden={true}
							className="size-6 shrink-0 self-start text-icon-error"
							data-slot="icon"
						/>
						{state.message}
					</Fragment>
				);
			}}
		</FormErrorMessage>
	);
}
