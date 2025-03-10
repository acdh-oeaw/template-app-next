"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { ChevronDownIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import {
	Button as AriaButton,
	ComboBox as AriaComboBox,
	type ComboBoxProps as AriaComboBoxProps,
	composeRenderProps,
	Group as AriaGroup,
	type GroupProps as AriaGroupProps,
} from "react-aria-components";

import { FieldStatusContext } from "@/components/ui/field-status-context";

interface ComboBoxProps<T extends object> extends AriaComboBoxProps<T> {}

export function ComboBox<T extends object>(props: ComboBoxProps<T>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaComboBox {...rest} className={cn("group grid gap-y-1", className)} data-slot="control">
			{composeRenderProps(children, (children, renderProps) => {
				return (
					<FieldStatusContext.Provider value={renderProps}>{children}</FieldStatusContext.Provider>
				);
			})}
		</AriaComboBox>
	);
}

interface ComboBoxTriggerProps extends AriaGroupProps {}

export function ComboBoxTrigger(props: ComboBoxTriggerProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaGroup
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn("group inline-grid items-center gap-x-2 forced-colors:bg-[Field]", className);
			})}
			data-slot="control"
		>
			{composeRenderProps(children, (children) => {
				return (
					<Fragment>
						{children}
						<AriaButton>
							<ChevronDownIcon
								aria-hidden={true}
								className="size-6 h-full shrink-0 text-icon-neutral group-invalid:text-icon-error group-disabled:text-icon-disabled forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
							/>
						</AriaButton>
					</Fragment>
				);
			})}
		</AriaGroup>
	);
}
