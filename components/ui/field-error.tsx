"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { OctagonXIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import {
	composeRenderProps,
	FieldError as AriaFieldError,
	type FieldErrorProps as AriaFieldErrorProps,
} from "react-aria-components";

interface FieldErrorProps extends AriaFieldErrorProps {}

export function FieldError(props: Readonly<FieldErrorProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaFieldError
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"inline-flex gap-x-2 py-1 text-tiny leading-6 font-strong text-text-error forced-colors:text-[Mark]",
					className,
				);
			})}
			data-slot="error"
		>
			{composeRenderProps(children, (children, renderProps) => {
				const { validationErrors } = renderProps;

				return (
					<Fragment>
						<OctagonXIcon
							aria-hidden={true}
							className="size-6 shrink-0 text-icon-error"
							data-slot="icon"
						/>
						{validationErrors}
					</Fragment>
				);
			})}
		</AriaFieldError>
	);
}
