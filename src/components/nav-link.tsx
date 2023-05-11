"use client";

import { usePathname } from "next-intl/client";
import { type ReactNode } from "react";

import { Link, type LinkProps } from "@/components/link";

interface NavLinkProps extends LinkProps {}

export function NavLink(props: NavLinkProps): ReactNode {
	const { children, href } = props;

	const pathname = usePathname();

	const isCurrent = href.pathname === pathname;

	return (
		<Link aria-current={isCurrent ? "page" : undefined} {...props}>
			{children}
		</Link>
	);
}
