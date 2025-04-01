"use client";

import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface LocaleSwitcherLoadingIndicatorProps {
	children: ReactNode;
}

export function LocaleSwitcherLoadingIndicator(
	props: LocaleSwitcherLoadingIndicatorProps,
): ReactNode {
	const { children } = props;

	const { pending: isPending } = useLinkStatus();

	if (isPending) {
		return <LoadingIndicator />;
	}

	return children;
}
