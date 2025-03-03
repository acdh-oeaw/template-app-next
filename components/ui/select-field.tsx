"use client";

import type { ReactNode } from "react";
import {
	Group as AriaGroup,
	Select as AriaSelect,
	SelectValue as AriaSelectValue,
	type SelectProps as AriaSelectProps,
	ListBox as AriaListBox,
	ListBoxItem as AriaListBoxItem,
	Button as AriaButton,
	Label as AriaLabel,
	FieldError as AriaFieldError,
	Popover as AriaPopover,
} from "react-aria-components";

interface SelectProps extends AriaSelectProps {
	label: ReactNode;
}

export function Select(props: SelectProps): ReactNode {
	const { label, ...rest } = props;

	return (
		<AriaSelect {...rest}>
			<AriaLabel>{label}</AriaLabel>
			<AriaGroup>
				<AriaButton>
					<AriaSelectValue />
				</AriaButton>
			</AriaGroup>
			<AriaFieldError />
			<AriaPopover>
				<AriaListBox></AriaListBox>
			</AriaPopover>
		</AriaSelect>
	);
}
