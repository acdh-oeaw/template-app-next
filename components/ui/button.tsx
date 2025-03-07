"use client";

import { type GetVariantProps, styles } from "@acdh-oeaw/style-variants";
import { Loader2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

const buttonStyles = styles({
	base: [
		"inline-grid items-center gap-x-2 border transition [grid-template-areas:'icon_content_icon-end']",
		"interactive hover:hover-overlay focus-visible:focus-outline pressed:press-overlay",
		"*:col-[content] *:data-[slot=icon]:col-[icon]",
	],
	variants: {
		kind: {
			primary:
				"border-transparent bg-fill-brand-strong text-text-inverse-strong shadow-raised disabled:bg-fill-disabled",
			secondary:
				"border-stroke-brand-strong text-text-brand shadow-raised disabled:border-stroke-disabled disabled:text-text-disabled",
			tertiary:
				"border-transparent text-text-brand underline hover:no-underline disabled:text-text-disabled pressed:no-underline",
		},
		size: {
			small: "min-h-8 rounded-2 px-3 py-1 text-tiny font-strong *:data-[slot=icon]:size-4",
			medium: "min-h-12 rounded-2 px-4 py-2.5 text-small font-strong *:data-[slot=icon]:size-5",
			large: "min-h-14 rounded-3 px-6 py-3 text-heading-4 font-strong *:data-[slot=icon]:size-6",
		},
		tone: {
			brand: "",
			neutral: "",
			destructive: "",
			inverse: "",
		},
	},
	defaults: {
		kind: "primary",
		size: "medium",
	},
});

type ButtonStyles = GetVariantProps<typeof buttonStyles>;

interface ButtonProps extends AriaButtonProps, ButtonStyles {}

export function Button(props: ButtonProps): ReactNode {
	const { children, className, isPending, kind, size, ...rest } = props;

	return (
		<AriaButton
			{...rest}
			className={buttonStyles({ className, kind, size })}
			data-status={isPending ? "pending" : undefined}
		>
			{isPending ? (
				<Loader2Icon aria-hidden={true} className="animate-spin" data-slot="icon" />
			) : null}
			{typeof children === "string" ? <span>{children}</span> : children}
		</AriaButton>
	);
}
