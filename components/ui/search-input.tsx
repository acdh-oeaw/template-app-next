"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	composeRenderProps,
	SearchField as AriaSearchField,
	type SearchFieldProps as AriaSearchFieldProps,
} from "react-aria-components";

import { FieldStatusContext } from "@/components/ui/field-status-context";

interface SearchInputProps extends AriaSearchFieldProps {}

export function SearchInput(props: SearchInputProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaSearchField
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn("group grid content-start gap-y-1", className);
			})}
			data-slot="field"
		>
			{composeRenderProps(children, (children, renderProps) => {
				return (
					/** @see https://github.com/adobe/react-spectrum/issues/6151 */
					<FieldStatusContext.Provider value={{ ...renderProps, isRequired: false }}>
						{children}
					</FieldStatusContext.Provider>
				);
			})}
		</AriaSearchField>
	);
}
