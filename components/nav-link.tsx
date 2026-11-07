"use client";

import type { ComponentProps, ReactNode } from "react";

import { Link, usePathname } from "#/lib/i18n/navigation.ts";

type NavLinkProps = ComponentProps<typeof Link>;

export function NavLink(props: Readonly<NavLinkProps>): ReactNode {
	const { href } = props;

	const pathname = usePathname();

	return <Link {...props} aria-current={pathname === href ? "page" : undefined} />;
}
