"use client";

import type { ReactNode } from "react";

import { Link, type LinkProps } from "@/components/link";
import { env } from "@/config/env.config";
import { createFullUrl } from "@/lib/create-full-url";
import { usePathname } from "@/lib/navigation";

interface NavLinkProps extends LinkProps {}

export function NavLink(props: NavLinkProps): ReactNode {
	const { children, href, ...rest } = props;

	const pathname = usePathname();

	const url = createFullUrl({ pathname: href });
	const isCurrent = url.origin === env.NEXT_PUBLIC_APP_BASE_URL && url.pathname === pathname;

	return (
		<Link aria-current={isCurrent ? "page" : undefined} {...rest} href={href}>
			{children}
		</Link>
	);
}
