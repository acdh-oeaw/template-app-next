"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	CheckboxGroup as AriaCheckBoxGroup,
	type CheckboxGroupProps as AriaCheckBoxGroupProps,
	composeRenderProps,
} from "react-aria-components";

interface CheckBoxGroupProps extends AriaCheckBoxGroupProps {}

export function CheckBoxGroup(props: CheckBoxGroupProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaCheckBoxGroup
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn("group grid content-start gap-y-7", className);
			})}
			data-slot="control"
		>
			{children}
		</AriaCheckBoxGroup>
	);
}
