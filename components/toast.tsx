"use client";

import "@/styles/toast.css";

import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
	Button as AriaButton,
	Text as AriaText,
	type ToastProps as AriaToastProps,
	UNSTABLE_Toast as AriaToast,
	UNSTABLE_ToastContent as AriaToastContent,
	UNSTABLE_ToastQueue as AriaToastQueue,
} from "react-aria-components";
import { flushSync } from "react-dom";

interface ToastContent {
	title: string;
	description?: string;
}

export const queue = new AriaToastQueue<ToastContent>({
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

interface ToastProps extends AriaToastProps<ToastContent> {}

export function Toast(props: ToastProps): ReactNode {
	const { toast } = props;

	return (
		<AriaToast
			{...props}
			className="flex items-center gap-4 bg-fill-brand-strong text-text-inverse-strong rounded-2 px-4 py-3 focus-visible:focus-outline"
			style={{
				// @ts-expect-error @see https://developer.chrome.com/blog/view-transitions-update-io24#view-transition-class
				viewTransitionClass: "toast",
				viewTransitionName: toast.key,
			}}
			toast={toast}
		>
			<AriaToastContent className="flex flex-col flex-1 min-w-0">
				<AriaText className="font-strong" slot="title">
					{toast.content.title}
				</AriaText>
				<AriaText slot="description">{toast.content.description}</AriaText>
			</AriaToastContent>
			<AriaButton
				className="rounded-full size-8 shrink-0 interactive hover:hover-overlay pressed:press-overlay focus-visible:focus-outline"
				slot="close"
			>
				<XIcon aria-hidden={true} className="size-6 shrink-0" />
			</AriaButton>
		</AriaToast>
	);
}
