"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { Fragment, type ReactNode } from "react";
import {
	composeRenderProps,
	OverlayArrow as AriaOverlayArrow,
	type TextProps as AriaTextProps,
	Tooltip as AriaTooltip,
	type TooltipProps as AriaTooltipProps,
	TooltipTrigger as AriaTooltipTrigger,
} from "react-aria-components";

export { AriaTooltipTrigger as TooltipTrigger };

interface TooltipProps extends AriaTooltipProps {}

export function Tooltip(props: Readonly<TooltipProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaTooltip
			offset={8}
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"group flex flex-col gap-y-1 rounded-[12px] bg-background-inverse px-8 py-6 text-tiny text-text-inverse-strong drop-shadow-overlay will-change-transform entering:placement-left:animate-popover-left-in entering:placement-right:animate-popover-right-in entering:placement-top:animate-popover-top-in entering:placement-bottom:animate-popover-bottom-in exiting:placement-left:animate-popover-left-out exiting:placement-right:animate-popover-right-out exiting:placement-top:animate-popover-top-out exiting:placement-bottom:animate-popover-bottom-out",
					className,
				);
			})}
		>
			{composeRenderProps(children, (children) => {
				return (
					<Fragment>
						<AriaOverlayArrow>
							<svg
								className="fill-background-inverse group-placement-left:-rotate-90 group-placement-right:rotate-90 group-placement-bottom:rotate-180 forced-colors:fill-[Canvas] forced-colors:stroke-[ButtonBorder]"
								height={8}
								viewBox="0 0 8 8"
								width={8}
							>
								<path d="M0 0 L4 4 L8 0" />
							</svg>
						</AriaOverlayArrow>
						{children}
					</Fragment>
				);
			})}
		</AriaTooltip>
	);
}

interface TooltipTitleProps extends AriaTextProps {}

export function TooltipTitle(props: TooltipTitleProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<span {...rest} className={cn("font-strong text-text-inverse-strong", className)}>
			{children}
		</span>
	);
}

interface TooltipDescriptionProps extends AriaTextProps {}

export function TooltipDescription(props: TooltipDescriptionProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<span {...rest} className={cn("text-text-inverse-weak", className)}>
			{children}
		</span>
	);
}
