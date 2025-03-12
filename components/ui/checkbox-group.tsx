"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ComponentPropsWithRef, ReactNode } from "react";
import {
	CheckboxGroup as AriaCheckBoxGroup,
	type CheckboxGroupProps as AriaCheckBoxGroupProps,
	composeRenderProps,
} from "react-aria-components";

import { FieldStatusContext } from "@/components/ui/field-status-context";

interface CheckBoxGroupProps extends AriaCheckBoxGroupProps {}

export function CheckBoxGroup(props: CheckBoxGroupProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaCheckBoxGroup
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn("grid content-start gap-y-7", className);
			})}
			data-slot="fieldset"
		>
			{composeRenderProps(children, (children, renderProps) => {
				return (
					<FieldStatusContext.Provider value={renderProps}>{children}</FieldStatusContext.Provider>
				);
			})}
		</AriaCheckBoxGroup>
	);
}

interface CheckBoxListProps extends ComponentPropsWithRef<"div"> {}

export function CheckBoxList(props: CheckBoxListProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<div {...rest} className={cn("grid content-start gap-y-4", className)}>
			{children}
		</div>
	);
}
