"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { ChevronDownIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	composeRenderProps,
	Select as AriaSelect,
	type SelectProps as AriaSelectProps,
	SelectValue as AriaSelectValue,
	type SelectValueProps as AriaSelectValueProps,
} from "react-aria-components";

import { FieldStatusContext } from "@/components/ui/field-status-context";

interface SelectProps<T extends object> extends AriaSelectProps<T> {}

export function Select<T extends object>(props: Readonly<SelectProps<T>>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaSelect
			{...rest}
			className={cn("group grid content-start gap-y-1", className)}
			data-slot="field"
		>
			{composeRenderProps(children, (children, renderProps) => {
				return <FieldStatusContext value={renderProps}>{children}</FieldStatusContext>;
			})}
		</AriaSelect>
	);
}

interface SelectTriggerProps extends AriaButtonProps {}

export function SelectTrigger(props: Readonly<SelectTriggerProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaButton
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"interactive isolate inline-flex min-h-12 items-center gap-x-2 rounded-2 border border-stroke-strong bg-fill-inverse-strong pr-12 pl-4 text-left transition group-invalid:border-2 group-invalid:border-stroke-error-strong group-invalid:bg-fill-error-weak hover:hover-overlay focus-visible:focus-outline disabled:border-stroke-disabled forced-colors:group-invalid:border-[Mark] forced-colors:disabled:border-[GrayText] forced-colors:disabled:text-[GrayText] pressed:press-overlay",
					className,
				);
			})}
			data-slot="control"
		>
			{composeRenderProps(children, (children) => {
				return (
					<Fragment>
						{children}
						<ChevronDownIcon
							aria-hidden={true}
							className="absolute top-0 right-4 size-6 h-full shrink-0 text-icon-neutral group-invalid:text-icon-error group-disabled:text-icon-disabled forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
							data-slot="icon"
						/>
					</Fragment>
				);
			})}
		</AriaButton>
	);
}

interface SelectValueProps<T extends object> extends AriaSelectValueProps<T> {}

export function SelectValue<T extends object>(props: Readonly<SelectValueProps<T>>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaSelectValue
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"inline-flex items-center gap-x-3 text-small text-text-strong group-disabled:text-text-disabled placeholder-shown:text-text-weak placeholder-shown:italic",
					className,
				);
			})}
		>
			{children}
		</AriaSelectValue>
	);
}
