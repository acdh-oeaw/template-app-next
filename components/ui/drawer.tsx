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
	// Text as AriaText,
	// type TextProps as AriaTextProps,
} from "react-aria-components";

export { AriaDialogTrigger as DrawerTrigger };

interface ModalOverlayProps extends AriaModalOverlayProps {}

export function ModalOverlay(props: ModalOverlayProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaModalOverlay
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"entering:animate-underlay-in exiting:animate-underlay-out fixed inset-0 isolate z-10 grid min-h-full w-full overflow-y-auto bg-fill-overlay backdrop-blur-xl",
					className,
				);
			})}
		>
			{children}
		</AriaModalOverlay>
	);
}

const modalStyles = styles({
	base: "h-full w-full overflow-hidden border border-stroke-weak bg-background-overlay shadow-overlay forced-colors:bg-[Canvas] entering:duration-300 entering:ease-out entering:animate-in exiting:duration-200 exiting:ease-in exiting:animate-out",
	variants: {
		placement: {
			bottom: "",
			left: "mr-16 justify-self-start entering:slide-in-from-left exiting:slide-out-to-left",
			right: "ml-16 justify-self-end entering:slide-in-from-right exiting:slide-out-to-right",
			top: "",
		},
		size: {
			small: "max-w-sm",
			large: "max-w-xl",
		},
	},
	defaults: {
		placement: "right",
		size: "small",
	},
});

type ModalStyleProps = GetVariantProps<typeof modalStyles>;

interface ModalProps extends AriaModalOverlayProps, ModalStyleProps {}

export function Modal(props: ModalProps): ReactNode {
	const { children, className, placement, size, ...rest } = props;

	return (
		<AriaModal
			{...rest}
			className={composeRenderProps(className, (className) => {
				return modalStyles({ className, placement: placement, size });
			})}
		>
			{children}
		</AriaModal>
	);
}

interface DrawerProps extends AriaDialogProps {}

export function Drawer(props: DrawerProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaDialog {...rest} className={cn("relative flex h-full flex-col outline-hidden", className)}>
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

interface DrawerBodyProps extends ComponentPropsWithRef<"div"> {}

export function DrawerBody(props: DrawerBodyProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<div {...rest} className={cn("grid flex-1 content-start gap-y-2 px-8 py-6", className)}>
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
