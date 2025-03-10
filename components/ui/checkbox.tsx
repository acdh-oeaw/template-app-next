"use client";

import { cn, type GetVariantProps, styles } from "@acdh-oeaw/style-variants";
import { CheckIcon, MinusIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import {
	Checkbox as AriaCheckBox,
	type CheckboxProps as AriaCheckBoxProps,
	composeRenderProps,
} from "react-aria-components";

const checkBoxStyles = styles({
	base: "group inline-flex items-center gap-x-3 text-text-strong disabled:text-text-disabled forced-colors:disabled:text-[GrayText]",
	variants: {
		size: {
			small: "text-tiny",
			large: "text-small",
		},
	},
	defaults: {
		size: "large",
	},
});

const checkBoxBoxStyles = styles({
	base: "interactive isolate inline-grid shrink-0 place-content-center rounded-1 border border-stroke-strong bg-fill-inverse-strong text-fill-inverse-strong transition group-invalid:border-stroke-error-strong group-invalid:bg-fill-error-weak group-hover:hover-overlay group-focus-visible:focus-outline group-disabled:border-stroke-disabled group-pressed:press-overlay group-selected:border-transparent group-selected:bg-fill-brand-strong group-selected:group-invalid:bg-fill-error-strong group-selected:group-disabled:bg-fill-disabled",
	variants: {
		size: {
			small: "size-6 rounded-[3px] p-1.5",
			large: "size-8 rounded-1 p-2",
		},
	},
	defaults: {
		size: "large",
	},
});

type CheckBoxStyles = GetVariantProps<typeof checkBoxStyles>;

interface CheckBoxProps extends AriaCheckBoxProps, CheckBoxStyles {}

export function CheckBox(props: CheckBoxProps): ReactNode {
	const { children, className, size, ...rest } = props;

	return (
		<AriaCheckBox
			{...rest}
			className={composeRenderProps(className, (className) => {
				return checkBoxStyles({ className, size });
			})}
			data-slot="control"
		>
			{composeRenderProps(children, (children, renderProps) => {
				const { isIndeterminate, isSelected } = renderProps;

				return (
					<Fragment>
						<div className={checkBoxBoxStyles({ size })}>
							{isIndeterminate ? (
								<MinusIcon
									aria-hidden={true}
									className="shrink-0 group-disabled:text-text-disabled forced-colors:text-[HighlightText]"
									data-slot="icon"
								/>
							) : isSelected ? (
								<CheckIcon
									aria-hidden={true}
									className="shrink-0 group-disabled:text-text-disabled forced-colors:text-[HighlightText]"
									data-slot="icon"
								/>
							) : null}
						</div>
						{children}
					</Fragment>
				);
			})}
		</AriaCheckBox>
	);
}
