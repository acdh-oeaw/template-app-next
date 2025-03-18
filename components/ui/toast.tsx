"use client";

import "@/styles/toast.css";

import { cn } from "@acdh-oeaw/style-variants";
import { XIcon } from "lucide-react";
import { type ReactNode, unstable_ViewTransition as ViewTransition } from "react";
import {
	Button as AriaButton,
	composeRenderProps,
	Text as AriaText,
	type ToastProps as AriaToastProps,
	UNSTABLE_Toast as AriaToast,
	UNSTABLE_ToastContent as AriaToastContent,
	UNSTABLE_ToastQueue as AriaToastQueue,
} from "react-aria-components";

export interface ToastContent {
	title: string;
	description?: string;
	status: "error" | "success";
}

export const toasts = new AriaToastQueue<ToastContent>();

interface ToastProps extends Omit<AriaToastProps<ToastContent>, "children"> {}

export function Toast(props: ToastProps): ReactNode {
	const { className, toast, ...rest } = props;

	return (
		<ViewTransition className="toast" name={toast.key}>
			<AriaToast
				{...rest}
				className={composeRenderProps(className, (className) => {
					return cn(
						"flex items-center gap-x-6 rounded-2 bg-fill-brand-strong px-6 py-4 text-text-inverse-strong shadow-overlay focus-visible:focus-outline",
						className,
					);
				})}
				toast={toast}
			>
				<AriaToastContent className="grid min-w-0 flex-1 gap-y-1">
					<AriaText className="text-small font-strong text-text-inverse-strong" slot="title">
						{toast.content.title}
					</AriaText>
					<AriaText className="text-small text-text-inverse-weak empty:hidden" slot="description">
						{toast.content.description}
					</AriaText>
				</AriaToastContent>
				<AriaButton
					className="interactive inline-grid shrink-0 place-content-center rounded-full text-icon-inverse hover:hover-overlay focus-visible:focus-outline pressed:press-overlay"
					slot="close"
				>
					<XIcon aria-hidden={true} className="size-6 shrink-0" data-slot="icon" />
				</AriaButton>
			</AriaToast>
		</ViewTransition>
	);
}
