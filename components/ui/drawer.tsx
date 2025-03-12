"use client";

import { cn, type GetVariantProps, styles } from "@acdh-oeaw/style-variants";
import type { ComponentPropsWithRef, ReactNode } from "react";
import {
	composeRenderProps,
	Dialog as AriaDialog,
	type DialogProps as AriaDialogProps,
	DialogTrigger as AriaDialogTrigger,
	Heading as AriaHeading,
	type HeadingProps as AriaHeadingProps,
	Modal as AriaModal,
	ModalOverlay as AriaModalOverlay,
	type ModalOverlayProps as AriaModalOverlayProps,
	Text as AriaText,
	type TextProps as AriaTextProps,
} from "react-aria-components";

export { AriaDialogTrigger as DrawerTrigger };

interface DrawerProps extends AriaDialogProps {}

export function Drawer(props: DrawerProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaDialog
			{...rest}
			className={cn(
				"relative flex flex-col outline-hidden",
				"ml-16 w-full border border-stroke-weak bg-background-overlay shadow-overlay",
				"max-w-sm",
				"max-w-xl",
				className,
			)}
		>
			{children}
		</AriaDialog>
	);
}

interface DrawerHeaderProps extends ComponentPropsWithRef<"header"> {}

export function DrawerHeader(props: DrawerHeaderProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<header
			{...rest}
			className={cn(
				"flex items-center justify-between gap-x-4 border-b border-stroke-weak px-8 py-6",
				className,
			)}
		>
			{children}
		</header>
	);
}

interface DrawerTitleProps extends AriaHeadingProps {}

export function DrawerTitle(props: DrawerTitleProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaHeading
			{...rest}
			className={cn("text-heading-3 font-strong text-text-strong", className)}
			slot="title"
		>
			{children}
		</AriaHeading>
	);
}

interface DialogContentProps extends ComponentPropsWithRef<"div"> {}

export function DialogContent(props: DialogContentProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<div {...rest} className={cn("grid flex-1 content-start gap-y-2", className)}>
			{children}
		</div>
	);
}

interface DrawerFooterProps extends ComponentPropsWithRef<"footer"> {}

export function DrawerFooter(props: DrawerFooterProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<footer
			{...rest}
			className={cn(
				"grid content-start gap-4 border-t border-stroke-weak px-8 py-6 sm:flex sm:items-center",
				className,
			)}
		>
			{children}
		</footer>
	);
}
