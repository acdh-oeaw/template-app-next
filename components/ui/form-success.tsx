import { cn } from "@acdh-oeaw/style-variants";
import { CheckCircle2Icon } from "lucide-react";
import { type ComponentPropsWithRef, Fragment, type ReactNode } from "react";

import { FormSuccessMessage } from "@/components/form-success-message";

interface FormSuccessProps extends ComponentPropsWithRef<typeof FormSuccessMessage> {}

export function FormSuccess(props: Readonly<FormSuccessProps>): ReactNode {
	const { className, ...rest } = props;

	return (
		<FormSuccessMessage
			{...rest}
			className={cn(
				"flex min-h-12 items-center gap-x-2 rounded-2 border border-stroke-success-weak bg-fill-success-weak px-4 py-2.5 text-small font-strong text-text-success",
				className,
			)}
		>
			{(state) => {
				return (
					<Fragment>
						<CheckCircle2Icon
							aria-hidden={true}
							className="size-6 shrink-0 self-start text-icon-success"
							data-slot="icon"
						/>
						{state.message}
					</Fragment>
				);
			}}
		</FormSuccessMessage>
	);
}
