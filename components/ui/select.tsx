"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	ListBox as AriaListBox,
	ListBoxItem as AriaListBoxItem,
	type ListBoxItemProps as AriaListBoxItemProps,
	type ListBoxProps as AriaListBoxProps,
	Popover as AriaPopover,
	type PopoverProps as AriaPopoverProps,
	Select as AriaSelect,
	type SelectProps as AriaSelectProps,
	SelectValue as AriaSelectValue,
	type SelectValueProps as AriaSelectValueProps,
} from "react-aria-components";

interface SelectProps extends AriaSelectProps {}

export function Select(props: SelectProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaSelect {...rest} className={cn("", className)}>
			{children}
		</AriaSelect>
	);
}

interface SelectTriggerProps extends AriaButtonProps {}

export function SelectTrigger(props: SelectTriggerProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaButton {...rest} className={cn("", className)}>
			{children}
		</AriaButton>
	);
}

interface SelectValueProps<T extends object> extends AriaSelectValueProps<T> {}

export function SelectValue<T extends object>(props: SelectValueProps<T>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaSelectValue {...rest} className={cn("", className)}>
			{children}
		</AriaSelectValue>
	);
}

interface PopoverProps extends AriaPopoverProps {}

export function Popover(props: PopoverProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaPopover {...rest} className={cn("", className)}>
			{children}
		</AriaPopover>
	);
}

interface ListBoxProps<T extends object> extends AriaListBoxProps<T> {}

export function ListBox<T extends object>(props: ListBoxProps<T>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaListBox {...rest} className={cn("", className)}>
			{children}
		</AriaListBox>
	);
}

interface ListBoxItemProps<T extends object> extends AriaListBoxItemProps<T> {}

export function ListBoxItem<T extends object>(props: ListBoxItemProps<T>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaListBoxItem {...rest} className={cn("", className)}>
			{children}
		</AriaListBoxItem>
	);
}
