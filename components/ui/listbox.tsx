"use client";

import { cn } from "@acdh-oeaw/style-variants";
// import { CheckIcon } from "lucide-react";
import { type ComponentPropsWithRef, Fragment, type ReactNode } from "react";
import {
	Collection as AriaCollection,
	composeRenderProps,
	Header as AriaHeader,
	ListBox as AriaListBox,
	ListBoxItem as AriaListBoxItem,
	type ListBoxItemProps as AriaListBoxItemProps,
	type ListBoxProps as AriaListBoxProps,
	ListBoxSection as AriaListBoxSection,
	type ListBoxSectionProps as AriaListBoxSectionProps,
	Separator as AriaSeparator,
	type SeparatorProps as AriaSeparatorProps,
	Text as AriaText,
	type TextProps as AriaTextProps,
} from "react-aria-components";

interface ListBoxProps<T extends object> extends AriaListBoxProps<T> {}

export function ListBox<T extends object>(props: ListBoxProps<T>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaListBox
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"group grid max-h-[inherit] overflow-auto py-2 text-text-strong outline-hidden",
					className,
				);
			})}
		>
			{children}
		</AriaListBox>
	);
}

interface ListBoxItemProps<T extends object> extends AriaListBoxItemProps<T> {
	textValue: string;
}

export function ListBoxItem<T extends object>(props: ListBoxItemProps<T>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaListBoxItem
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"interactive isolate inline-flex cursor-default items-center gap-x-2 py-3 pr-12 pl-4 transition will-change-transform forced-color-adjust-none select-none hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 disabled:text-text-disabled forced-colors:focus:bg-[Highlight] forced-colors:focus:text-[HighlightText] forced-colors:disabled:text-[GrayText] pressed:press-overlay selected:border-l-4 selected:border-stroke-selected selected:bg-fill-brand-weak forced-colors:selected:bg-[Highlight] forced-colors:selected:text-[HighlightText]",
					className,
				);
			})}
		>
			{composeRenderProps(children, (children, _renderProps) => {
				// const { isSelected } = renderProps;

				return (
					<Fragment>
						{children}
						{/* {isSelected ? (
							<CheckIcon
								aria-hidden={true}
								className="absolute right-4 size-6 h-full shrink-0 text-icon-brand"
								data-slot="icon"
							/>
						) : null} */}
					</Fragment>
				);
			})}
		</AriaListBoxItem>
	);
}

interface ListBoxItemLabelProps extends AriaTextProps {}

export function ListBoxItemLabel(props: ListBoxItemLabelProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaText slot="label" {...rest} className={cn("", className)}>
			{children}
		</AriaText>
	);
}

interface ListBoxSeparatorProps extends AriaSeparatorProps {}

export function ListBoxSeparator(props: ListBoxSeparatorProps): ReactNode {
	const { className, ...rest } = props;

	return <AriaSeparator {...rest} className={cn("border-t border-stroke-weak", className)} />;
}

interface ListBoxSectionProps<T extends object> extends AriaListBoxSectionProps<T> {
	items?: Array<T>;
}

export function ListBoxSection<T extends object>(props: ListBoxSectionProps<T>): ReactNode {
	const { children, className, items, ...rest } = props;

	return (
		<AriaListBoxSection {...rest} className={cn("", className)}>
			<AriaCollection items={items}>{children}</AriaCollection>
		</AriaListBoxSection>
	);
}

interface ListBoxSectionHeaderProps extends ComponentPropsWithRef<typeof AriaHeader> {}

export function ListBoxSectionHeader(props: ListBoxSectionHeaderProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaHeader {...rest} className={cn("sticky top-0 z-10 truncate", className)}>
			{children}
		</AriaHeader>
	);
}

interface ListBoxEmptyStateProps extends ComponentPropsWithRef<"div"> {}

export function ListBoxEmptyState(props: ListBoxEmptyStateProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<div {...rest} className={cn("text-center text-text-weak", className)}>
			{children}
		</div>
	);
}
