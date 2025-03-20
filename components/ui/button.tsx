"use client";

import { type GetVariantProps, styles } from "@acdh-oeaw/style-variants";
import { Loader2Icon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	composeRenderProps,
} from "react-aria-components";

const buttonStyles = styles({
	base: "*:data-[slot=icon]:first-child:-ml-1 *:data-[slot=icon]:last-child:-mr-1 interactive isolate inline-flex items-center justify-center gap-x-2 border text-center transition hover:hover-overlay focus-visible:focus-outline *:data-[slot=icon]:shrink-0 forced-colors:disabled:text-[GrayText] pending:opacity-75 pressed:press-overlay",
	variants: {
		kind: {
			primary:
				"border-transparent shadow-raised disabled:bg-fill-disabled disabled:shadow-none pressed:shadow-none",
			secondary:
				"shadow-raised disabled:border-stroke-disabled disabled:text-text-disabled disabled:shadow-none pressed:shadow-none",
			tertiary:
				"border-transparent underline hover:no-underline disabled:text-text-disabled pressed:no-underline",
		},
		size: {
			small: "rounded-2 text-tiny font-strong",
			medium: "rounded-2 text-small font-strong",
			large: "rounded-3 text-heading-4 font-strong",
		},
		tone: {
			brand: "",
			neutral: "",
			destructive: "",
			inverse: "",
		},
		variant: {
			default: "",
			"icon-only": "",
		},
	},
	combinations: [
		[
			{ kind: "primary", tone: "brand" },
			"bg-fill-brand-strong text-text-inverse-strong *:data-[slot=icon]:text-icon-inverse",
		],
		[
			{ kind: "primary", tone: "neutral" },
			"bg-fill-strong text-text-inverse-strong *:data-[slot=icon]:text-icon-inverse",
		],
		[
			{ kind: "primary", tone: "destructive" },
			"bg-fill-error-strong text-text-inverse-strong *:data-[slot=icon]:text-icon-inverse",
		],
		[
			{ kind: "primary", tone: "inverse" },
			"bg-fill-inverse-strong text-text-strong *:data-[slot=icon]:text-icon-neutral",
		],

		[
			{ kind: "secondary", tone: "brand" },
			"border-stroke-brand-strong text-text-brand *:data-[slot=icon]:text-icon-brand",
		],
		[
			{ kind: "secondary", tone: "neutral" },
			"border-stroke-strong text-text-weak *:data-[slot=icon]:text-icon-neutral",
		],
		[
			{ kind: "secondary", tone: "destructive" },
			"border-stroke-error-strong text-text-error *:data-[slot=icon]:text-icon-error",
		],
		[
			{ kind: "secondary", tone: "inverse" },
			"border-stroke-inverse-strong text-text-inverse-strong *:data-[slot=icon]:text-icon-inverse",
		],

		[{ kind: "tertiary", tone: "brand" }, "text-text-brand *:data-[slot=icon]:text-icon-brand"],
		[{ kind: "tertiary", tone: "neutral" }, "text-text-weak *:data-[slot=icon]:text-icon-neutral"],
		[
			{ kind: "tertiary", tone: "destructive" },
			"text-text-error *:data-[slot=icon]:text-icon-error",
		],
		[
			{ kind: "tertiary", tone: "inverse" },
			"text-text-inverse-strong *:data-[slot=icon]:text-icon-inverse",
		],

		[{ size: "small", variant: "default" }, "min-h-8 px-3 py-1 *:data-[slot=icon]:size-4"],
		[{ size: "medium", variant: "default" }, "min-h-12 px-4 py-2.5 *:data-[slot=icon]:size-5"],
		[{ size: "large", variant: "default" }, "min-h-14 px-6 py-3 *:data-[slot=icon]:size-6"],

		[{ size: "small", variant: "icon-only" }, "size-8 *:data-[slot=icon]:size-4"],
		[{ size: "medium", variant: "icon-only" }, "size-12 *:data-[slot=icon]:size-6"],
		[{ size: "large", variant: "icon-only" }, "size-14 *:data-[slot=icon]:size-6"],
	],
	defaults: {
		kind: "primary",
		size: "medium",
		tone: "brand",
		variant: "default",
	},
});

type ButtonStyleProps = GetVariantProps<typeof buttonStyles>;

interface ButtonProps extends AriaButtonProps, ButtonStyleProps {}

export function Button(props: ButtonProps): ReactNode {
	const { children, className, kind, size, tone, variant, ...rest } = props;

	return (
		<AriaButton
			{...rest}
			className={composeRenderProps(className, (className) => {
				return buttonStyles({ className, kind, size, tone, variant });
			})}
		>
			{composeRenderProps(children, (children) => {
				return (
					<Fragment>
						{props.isPending ? (
							<Loader2Icon aria-hidden={true} className="animate-spin" data-slot="icon" />
						) : null}
						{children}
					</Fragment>
				);
			})}
		</AriaButton>
	);
}
