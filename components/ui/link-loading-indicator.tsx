"use client";

import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

interface LinkLoadingIndicatorProps {
	children: ReactNode;
}

export function LinkLoadingIndicator(props: Readonly<LinkLoadingIndicatorProps>): ReactNode {
	const { children } = props;

	const { pending: isPending } = useLinkStatus();

	return (
		<span
			className="pending:animate-loading-indicator-pulse-in"
			data-pending={isPending || undefined}
		>
			{children}
		</span>
	);
}
