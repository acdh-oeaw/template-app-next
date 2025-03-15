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

export { AriaDialogTrigger as DialogTrigger };

interface ModalOverlayProps extends AriaModalOverlayProps {}

export function ModalOverlay(props: ModalOverlayProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaModalOverlay
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"fixed inset-0 isolate z-10 flex min-h-full items-end justify-center overflow-y-auto bg-fill-overlay p-4 xs:items-center entering:animate-underlay-in exiting:animate-underlay-out",
					className,
				);
			})}
		>
			{children}
		</AriaModalOverlay>
	);
}

const modalStyles = styles({
	base: "exiting:overlay-out w-full overflow-hidden rounded-4 border border-stroke-weak bg-background-overlay p-8 shadow-overlay forced-colors:bg-[Canvas] entering:animate-overlay-in",
	variants: {
		size: {
			small: "max-w-lg",
			large: "max-w-2xl max-xs:h-full",
		},
	},
	defaults: {
		size: "small",
	},
});

type ModalStyleProps = GetVariantProps<typeof modalStyles>;

interface ModalProps extends AriaModalOverlayProps, ModalStyleProps {}

export function Modal(props: ModalProps): ReactNode {
	const { children, className, size, ...rest } = props;

	return (
		<AriaModal
			{...rest}
			className={composeRenderProps(className, (className) => {
				return modalStyles({ className, size });
			})}
		>
			{children}
		</AriaModal>
	);
}

interface DialogProps extends AriaDialogProps {}

export function Dialog(props: DialogProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaDialog
			{...rest}
			className={cn("relative flex flex-col gap-y-6 outline-hidden", className)}
		>
			{children}
		</AriaDialog>
	);
}

interface DialogHeaderProps extends ComponentPropsWithRef<"header"> {}

export function DialogHeader(props: DialogHeaderProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<header
			{...rest}
			className={cn(
				"grid content-start gap-y-2 *:data-[slot=icon]:mb-2 *:data-[slot=icon]:size-12",
				className,
			)}
		>
			{children}
		</header>
	);
}

interface DialogTitleProps extends AriaHeadingProps {}

export function DialogTitle(props: DialogTitleProps): ReactNode {
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

interface DialogDescriptionProps extends AriaTextProps {}

export function DialogDescription(props: DialogDescriptionProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaText {...rest} className={cn("text-small text-text-weak", className)} slot="description">
			{children}
		</AriaText>
	);
}

interface DialogBodyProps extends ComponentPropsWithRef<"div"> {}

export function DialogBody(props: DialogBodyProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<div {...rest} className={cn("grid flex-1 content-start gap-y-2", className)}>
			{children}
		</div>
	);
}

interface DialogFooterProps extends ComponentPropsWithRef<"footer"> {}

export function DialogFooter(props: DialogFooterProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<footer {...rest} className={cn("grid content-start gap-4 sm:flex sm:items-center", className)}>
			{children}
		</footer>
	);
}
