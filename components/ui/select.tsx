"use client";

import type { ReactNode } from "react";
import {
	Button as AriaButton,
	FieldError as AriaFieldError,
	Group as AriaGroup,
	Label as AriaLabel,
	ListBox as AriaListBox,
	ListBoxItem as AriaListBoxItem,
	Popover as AriaPopover,
	Select as AriaSelect,
	type SelectProps as AriaSelectProps,
	SelectValue as AriaSelectValue,
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
