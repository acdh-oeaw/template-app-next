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
	base: "*:data-[slot=icon]:first-child:-ml-1 *:data-[slot=icon]:last-child:-mr-1 interactive isolate inline-flex items-center justify-center gap-x-2 border text-center transition hover:hover-overlay focus-visible:focus-outline forced-colors:disabled:text-[GrayText] pressed:press-overlay",
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
	combinations: [
		[{ kind: "primary", tone: "brand" }, "bg-fill-brand-strong text-text-inverse-strong"],
		[{ kind: "primary", tone: "neutral" }, "bg-fill-strong text-text-inverse-strong"],
		[{ kind: "primary", tone: "destructive" }, "bg-fill-error-strong text-text-inverse-strong"],
		[{ kind: "primary", tone: "inverse" }, "bg-fill-inverse-strong text-text-strong"],

		[{ kind: "secondary", tone: "brand" }, "border-stroke-brand-strong text-text-brand"],
		[{ kind: "secondary", tone: "neutral" }, "border-stroke-strong text-text-weak"],
		[{ kind: "secondary", tone: "destructive" }, "border-stroke-error-strong text-text-error"],
		[
			{ kind: "secondary", tone: "inverse" },
			"border-stroke-inverse-strong text-text-inverse-strong",
		],

		[{ kind: "tertiary", tone: "brand" }, "text-text-brand"],
		[{ kind: "tertiary", tone: "neutral" }, "text-text-weak"],
		[{ kind: "tertiary", tone: "destructive" }, "text-text-error"],
		[{ kind: "tertiary", tone: "inverse" }, "text-text-inverse-strong"],
	],
	defaults: {
		kind: "primary",
		size: "medium",
		tone: "brand",
	},
});

type ButtonStyles = GetVariantProps<typeof buttonStyles>;

interface ButtonProps extends AriaButtonProps, ButtonStyles {}

export function Button(props: ButtonProps): ReactNode {
	const { children, className, kind, size, tone, ...rest } = props;

	return (
		<AriaButton
			{...rest}
			className={composeRenderProps(className, (className) => {
				return buttonStyles({ className, kind, size, tone });
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
