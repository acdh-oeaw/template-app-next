// eslint-disable-next-line no-restricted-imports
import Link from "next/link";
import type { ComponentPropsWithRef, FC } from "react";

// eslint-disable-next-line no-restricted-imports
export { redirect, usePathname, useRouter, useSearchParams } from "next/navigation";

export type LocaleLinkProps = Omit<ComponentPropsWithRef<typeof Link>, "href"> & {
	href: string | undefined;
};

export const LocaleLink = Link as FC<LocaleLinkProps>;

export interface NavigationAction {
	type: "action";
	onAction: () => void;
	label: string;
}

export interface NavigationLink {
	type: "link";
	href: string;
	label: string;
}

export interface NavigationSeparator {
	type: "separator";
}

export type NavigationMenuItem = NavigationLink | NavigationSeparator | NavigationAction;

export interface NavigationMenu {
	type: "menu";
	label: string;
	children: Record<string, NavigationMenuItem>;
}

export type NavigationItem =
	| NavigationAction
	| NavigationLink
	| NavigationSeparator
	| NavigationMenu;
