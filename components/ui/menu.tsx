"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import {
	composeRenderProps,
	Menu as AriaMenu,
	MenuItem as AriaMenuItem,
	type MenuItemProps as AriaMenuItemProps,
	type MenuProps as AriaMenuProps,
	MenuTrigger as AriaMenuTrigger,
} from "react-aria-components";

export { AriaMenuTrigger as MenuTrigger };

interface MenuProps<T extends object> extends AriaMenuProps<T> {}

export function Menu<T extends object>(props: MenuProps<T>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaMenu
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"group grid max-h-[inherit] overflow-auto py-2 text-small text-text-strong outline-hidden",
					className,
				);
			})}
		>
			{children}
		</AriaMenu>
	);
}

interface MenuItemProps<T extends object> extends AriaMenuItemProps<T> {
	textValue: string;
}

export function MenuItem<T extends object>(props: MenuItemProps<T>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<AriaMenuItem
			{...rest}
			className={composeRenderProps(className, (className) => {
				return cn(
					"interactive isolate inline-flex cursor-default items-center gap-x-3 py-3 pr-12 pl-4 transition will-change-transform forced-color-adjust-none select-none hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 disabled:text-text-disabled forced-colors:focus:bg-[Highlight] forced-colors:focus:text-[HighlightText] forced-colors:disabled:text-[GrayText] pressed:press-overlay selected:select-overlay-left selected:bg-fill-brand-weak forced-colors:selected:bg-[Highlight] forced-colors:selected:text-[HighlightText]",
					props.href != null ? "cursor-pointer" : "",
					className,
				);
			})}
		>
			{children}
		</AriaMenuItem>
	);
}
