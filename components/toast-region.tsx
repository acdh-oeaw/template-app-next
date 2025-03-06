"use client";

import type { ReactNode } from "react";
import { UNSTABLE_ToastRegion as AriaToastRegion } from "react-aria-components";

import { queue, Toast } from "@/components/toast";

export function ToastRegion(): ReactNode {
	return (
		<AriaToastRegion
			className="fixed right-4 bottom-4 flex flex-col gap-2 rounded-2 outline-hidden focus-visible:focus-outline"
			queue={queue}
		>
			{({ toast }) => {
				return <Toast toast={toast} />;
			}}
		</AriaToastRegion>
	);
}
