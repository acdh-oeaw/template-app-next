"use client";

import { compose, type GetVariantProps, styles } from "@acdh-oeaw/style-variants";
import type { ElementRef } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	composeRenderProps,
} from "react-aria-components";

import { focusRing } from "@/components/ui/focus-ring";
import { type ForwardedRef, forwardRef } from "@/lib/forward-ref";

export const buttonStyles = compose(
	focusRing,
	styles({
		base: "rounded-md font-medium inline-flex cursor-default items-center justify-center whitespace-nowrap transition",
		variants: {
			size: {
				sm: "rounded-md text-xs h-8 px-3",
				md: "h-9 text-sm px-4 py-2",
				lg: "rounded-md text-sm h-10 px-8",
				icon: "size-9",
			},
			variant: {
				primary: "bg-primary text-on-primary hover:bg-primary/90 pressed:bg-primary/80 shadow-sm",
				secondary:
					"bg-secondary text-on-secondary hover:bg-secondary/80 pressed:bg-secondary/70 shadow-sm",
				negative:
					"bg-negative text-on-negative hover:bg-negative/90 pressed:bg-negative/80 shadow-sm",
				outline:
					"border-input bg-background hover:bg-accent hover:text-on-accent pressed:bg-accent/90 border shadow-sm",
				ghost: "hover:bg-accent hover:text-on-accent pressed:bg-accent/90",
				// link: "text-primary underline-offset-4 hover:underline",
			},
			isDisabled: {
				true: "pointer-events-none opacity-50 forced-colors:text-[GrayText]",
			},
		},
		defaults: {
			size: "md",
			variant: "primary",
		},
	}),
);

export type ButtonVariantProps = GetVariantProps<typeof buttonStyles>;

export interface ButtonProps extends AriaButtonProps, ButtonVariantProps {}

export const Button = forwardRef(function Button(
	props: ButtonProps,
	forwardedRef: ForwardedRef<ElementRef<typeof AriaButton>>,
) {
	const { children, className, size, variant, ...rest } = props;

	return (
		<AriaButton
			ref={forwardedRef}
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return buttonStyles({ ...renderProps, className, size, variant });
			})}
		>
			{children}
		</AriaButton>
	);
});
