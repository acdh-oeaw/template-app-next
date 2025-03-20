"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	Separator as AriaSeparator,
	type SeparatorProps as AriaSeparatorProps,
} from "react-aria-components";

interface SeparatorProps extends AriaSeparatorProps {}

export function Separator(props: Readonly<SeparatorProps>): ReactNode {
	const { className, ...rest } = props;

	return (
		<AriaSeparator
			{...rest}
			className={cn(
				"border-stroke-weak orientation-horizontal:w-full orientation-horizontal:border-t orientation-vertical:h-full orientation-vertical:border-l",
				className,
			)}
		/>
	);
}
