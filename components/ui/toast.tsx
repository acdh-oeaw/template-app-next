"use client";

import { type GetVariantProps, styles } from "@acdh-oeaw/style-variants";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
	Button as AriaButton,
	composeRenderProps,
	Text as AriaText,
	type ToastProps as AriaToastProps,
	UNSTABLE_Toast as AriaToast,
	UNSTABLE_ToastContent as AriaToastContent,
	UNSTABLE_ToastQueue as AriaToastQueue,
} from "react-aria-components";
import { flushSync } from "react-dom";

const toastStyles = styles({
	base: "flex max-w-150 gap-x-3 rounded-2 border border-l-4 p-6 shadow-overlay outline-transparent focus-visible:focus-outline",
	variants: {
		tone: {
			error: "border-stroke-error-weak border-l-stroke-error-strong bg-fill-error-weak",
			warning: "border-stroke-warning-weak border-l-stroke-warning-strong bg-fill-warning-weak",
			success: "border-stroke-success-weak border-l-stroke-success-strong bg-fill-success-weak",
			information:
				"border-stroke-information-weak border-l-stroke-information-strong bg-fill-information-weak",
			neutral: "border-stroke-neutral-weak border-l-stroke-neutral-strong bg-fill-neutral-weak",
			brand: "border-stroke-brand-weak border-l-stroke-brand-strong bg-fill-brand-weak",
			"inverse-neutral":
				"border-transparent border-l-stroke-inverse-strong bg-background-inverse **:[slot=description]:text-text-inverse-weak **:[slot=title]:text-text-inverse-strong",
			"inverse-brand":
				"border-transparent border-l-stroke-inverse-strong bg-fill-brand-strong **:[slot=description]:text-text-inverse-weak **:[slot=title]:text-text-inverse-strong",
		},
	},
	defaults: {},
});

type ToastStyleProps = GetVariantProps<typeof toastStyles>;

export interface ToastContent extends ToastStyleProps {
	title: string;
	description?: string;
}

export const toasts = new AriaToastQueue<ToastContent>({
	wrapUpdate(fn) {
		if ("startViewTransition" in document) {
			document.startViewTransition(() => {
				flushSync(fn);
			});
		} else {
			fn();
		}
	},
});

interface ToastProps extends Omit<AriaToastProps<ToastContent>, "children"> {}

export function Toast(props: Readonly<ToastProps>): ReactNode {
	const { className, toast, ...rest } = props;

	return (
		<AriaToast
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				const { toast } = renderProps;

				return toastStyles({ className, tone: toast.content.tone });
			})}
			style={{
				// @ts-expect-error @see https://developer.chrome.com/blog/view-transitions-update-io24#view-transition-class
				viewTransitionClass: "toast",
				viewTransitionName: toast.key,
			}}
			toast={toast}
		>
			<AriaToastContent className="flex min-w-0 flex-1 flex-col gap-y-1">
				<AriaText className="text-heading-4 font-strong text-text-strong" slot="title">
					{toast.content.title}
				</AriaText>
				<AriaText className="text-small text-text-weak empty:hidden" slot="description">
					{toast.content.description}
				</AriaText>
			</AriaToastContent>
			<AriaButton
				className="interactive inline-grid shrink-0 place-content-center rounded-2 text-icon-neutral outline-transparent hover:hover-overlay focus-visible:focus-outline pressed:press-overlay"
				slot="close"
			>
				<XIcon aria-hidden={true} className="size-6 shrink-0" data-slot="icon" />
			</AriaButton>
		</AriaToast>
	);
}
