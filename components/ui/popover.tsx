"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { Fragment, type ReactNode } from "react";
import {
	composeRenderProps,
	OverlayArrow as AriaOverlayArrow,
	type OverlayArrowProps as AriaOverlayArrowProps,
	Popover as AriaPopover,
	type PopoverProps as AriaPopoverProps,
} from "react-aria-components";

interface PopoverProps extends AriaPopoverProps {}

export function Popover(props: PopoverProps): ReactNode {
	const { children, className, ...rest } = props;

	const isArrowVisible = false as boolean; // FIXME:
	// let popoverContext = useSlottedContext(PopoverContext);
	// let isSubmenu = popoverContext?.trigger === 'SubmenuTrigger';
	// let offset = isArrowVisible ? 12 : 8;
	// offset = isSubmenu ? offset - 6 : offset;

	return (
		<AriaPopover
			offset={8}
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"min-w-(--trigger-width) rounded-2 border border-stroke-weak bg-background-overlay shadow-overlay forced-colors:bg-[Canvas] entering:placement-left:animate-popover-left-in entering:placement-right:animate-popover-right-in entering:placement-top:animate-popover-top-in entering:placement-bottom:animate-popover-bottom-in exiting:placement-left:animate-popover-left-out exiting:placement-right:animate-popover-right-out exiting:placement-top:animate-popover-top-out exiting:placement-bottom:animate-popover-bottom-out",
					className,
				);
			})}
		>
			{composeRenderProps(children, (children) => {
				return (
					<Fragment>
						{isArrowVisible ? <OverlayArrow /> : null}
						{children}
					</Fragment>
				);
			})}
		</AriaPopover>
	);
}

interface OverlayArrowProps extends AriaOverlayArrowProps {}

function OverlayArrow(_props: OverlayArrowProps): ReactNode {
	return (
		<AriaOverlayArrow className="group">
			<svg
				className="block fill-background-overlay stroke-stroke-weak stroke-1 group-placement-left:-rotate-90 group-placement-right:rotate-90 group-placement-bottom:rotate-180 forced-colors:fill-[Canvas] forced-colors:stroke-[ButtonBorder]"
				height={12}
				viewBox="0 0 12 12"
				width={12}
			>
				<path d="M0 0 L6 6 L12 0" />
			</svg>
		</AriaOverlayArrow>
	);
}
