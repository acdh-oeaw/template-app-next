"use client";

import { type GetVariantProps, styles } from "@acdh-oeaw/style-variants";
import { Loader2Icon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import {
	composeRenderProps,
	ProgressBar as AriaProgressBar,
	type ProgressBarProps as AriaProgressBarProps,
} from "react-aria-components";

const loadingIndicatorStyles = styles({
	base: "shrink-0 text-text-weak",
	variants: {
		size: {
			small: "size-6",
			medium: "size-10",
			large: "size-14",
		},
	},
	defaults: {
		size: "medium",
	},
});

type LoadingIndicatorStyleProps = GetVariantProps<typeof loadingIndicatorStyles>;

interface LoadingIndicatorProps
	extends Omit<AriaProgressBarProps, "isIndeterminate">,
		LoadingIndicatorStyleProps {}

export function LoadingIndicator(props: Readonly<LoadingIndicatorProps>): ReactNode {
	const { children, className, size, ...rest } = props;

	return (
		<AriaProgressBar
			{...rest}
			className={composeRenderProps(className, (className) => {
				return loadingIndicatorStyles({ className, size });
			})}
			data-pending="true"
			isIndeterminate={true}
		>
			{composeRenderProps(children, (children) => {
				return (
					<Fragment>
						<Loader2Icon
							aria-hidden={true}
							className="size-full animate-loading-indicator-in"
							data-slot="icon"
						/>
						{children}
					</Fragment>
				);
			})}
		</AriaProgressBar>
	);
}
