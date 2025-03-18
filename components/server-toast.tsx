"use client";

import { type ReactNode, useEffect } from "react";

import { type ToastContent, toasts } from "@/components/ui/toast";

interface ServerToastProps {
	toast: {
		content: ToastContent;
		options?: {
			timeout?: number;
		};
	};
}

export function ServerToast(props: Readonly<ServerToastProps>): ReactNode {
	const { toast } = props;

	useEffect(() => {
		const key = toasts.add(toast.content, toast.options);

		return () => {
			toasts.close(key);
		};
	}, [toast]);

	return null;
}
