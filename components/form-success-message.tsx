import { cn } from "@acdh-oeaw/style-variants";
import { Fragment, type ReactNode } from "react";

import type { ActionState, SuccessActionState } from "@/lib/server/actions";

interface FormSuccessMessageProps {
	children?: ReactNode | ((state: SuccessActionState) => ReactNode);
	className?: string;
	state: ActionState;
}

export function FormSuccessMessage(props: Readonly<FormSuccessMessageProps>): ReactNode {
	const { children, className, state, ...rest } = props;

	return (
		<div
			{...rest}
			aria-atomic={true}
			aria-live="polite"
			className={cn(className, { "sr-only": state.status !== "success" })}
		>
			<Fragment key={state.timestamp}>
				{state.status === "success"
					? children != null
						? typeof children === "function"
							? children(state)
							: children
						: state.message
					: null}
			</Fragment>
		</div>
	);
}
