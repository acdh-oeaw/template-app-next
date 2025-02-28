"use client";

import { type ReactNode, useEffect } from "react";

import { queue, type ToastContent } from "@/components/toast";

interface RedirectToastProps {
	toast: {
		content: ToastContent;
		options?: {
			timeout?: number;
		};
	};
}

export function RedirectToast(props: Readonly<RedirectToastProps>): ReactNode {
	const { toast } = props;

	useEffect(() => {
		const key = queue.add(toast.content, toast.options);

		return () => {
			queue.close(key);
		};
	}, [toast]);

	return null;
}
