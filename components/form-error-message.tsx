import { cn } from "@acdh-oeaw/style-variants";
import { Fragment, type ReactNode } from "react";

import type { ActionState, ErrorActionState } from "@/lib/server/actions";
// import { useRenderProps } from "@/lib/use-render-props";

interface FormErrorMessageProps {
	children?: ReactNode | ((state: ErrorActionState) => ReactNode);
	className?: string;
	state: ActionState;
}

export function FormErrorMessage(props: Readonly<FormErrorMessageProps>): ReactNode {
	const { children, className, state, ...rest } = props;

	// TODO: useRenderProps
	// const renderProps = useRenderProps({
	// 	...props,
	// 	values: state,
	// });

	return (
		<div
			{...rest}
			aria-atomic={true}
			aria-live="assertive"
			className={cn(className, { "sr-only": state.status !== "error" })}
		>
			<Fragment key={state.timestamp}>
				{state.status === "error"
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
