"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	composeRenderProps,
	type ToastRegionProps as AriaToastRegionProps,
	UNSTABLE_ToastRegion as AriaToastRegion,
} from "react-aria-components";

import { Toast, type ToastContent, toasts } from "@/components/ui/toast";

interface ToastRegionProps extends Omit<AriaToastRegionProps<ToastContent>, "children" | "queue"> {}

export function ToastRegion(props: Readonly<ToastRegionProps>): ReactNode {
	const { className, ...rest } = props;

	return (
		<AriaToastRegion
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"fixed right-4 bottom-4 flex flex-col items-end gap-2 rounded-2 outline-hidden focus-visible:focus-outline",
					className,
				);
			})}
			queue={toasts}
		>
			{({ toast }) => {
				return <Toast toast={toast} />;
			}}
		</AriaToastRegion>
	);
}
