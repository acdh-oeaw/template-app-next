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

export function ComboBox<T extends object>(props: Readonly<ComboBoxProps<T>>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaComboBox
			{...rest}
			className={cn("group grid content-start gap-y-1", className)}
			data-slot="field"
		>
			{composeRenderProps(children, (children, renderProps) => {
				return <FieldStatusContext value={renderProps}>{children}</FieldStatusContext>;
			})}
		</AriaComboBox>
	);
}

interface ComboBoxTriggerProps extends AriaGroupProps {}

export function ComboBoxTrigger(props: Readonly<ComboBoxTriggerProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaGroup
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"relative isolate inline-flex items-center gap-x-2 *:data-[slot=control]:flex-1 *:data-[slot=control]:pr-12 forced-colors:bg-[Field]",
					className,
				);
			})}
			data-slot="control"
		>
			{composeRenderProps(children, (children) => {
				return (
					<Fragment>
						{children}
						<AriaButton className="absolute top-0 right-3 bottom-0 isolate inline-grid size-8 shrink-0 place-content-center self-center rounded-1 transition">
							<ChevronDownIcon
								aria-hidden={true}
								className="size-6 h-full shrink-0 text-icon-neutral group-invalid:text-icon-error group-disabled:text-icon-disabled forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
								data-slot="icon"
							/>
						</AriaButton>
					</Fragment>
				);
			})}
		</AriaGroup>
	);
}
