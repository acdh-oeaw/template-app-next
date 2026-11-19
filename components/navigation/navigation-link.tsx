"use client";

import { type ReactNode, Suspense } from "react";

import { Link } from "#/components/link.tsx";
import { usePathname } from "#/lib/i18n/navigation.ts";
import { getAriaCurrent } from "#/lib/navigation/get-aria-current.ts";
import type { Href } from "#/lib/navigation/href.ts";

interface NavigationLinkProps {
	children: ReactNode;
	href: Href;
}

function CurrentNavigationLink(props: Readonly<NavigationLinkProps>): ReactNode {
	const { children, href } = props;

	const pathname = usePathname();

	return (
		<Link aria-current={getAriaCurrent(pathname, href)} className="block aria-[current]:underline" href={href}>
			{children}
		</Link>
	);
}

/**
 * The pathname is unknown when prerendering dynamic params missing from `generateStaticParams`, so `usePathname`
 * suspends, and the fallback renders the link without `aria-current`.
 */
export function NavigationLink(props: Readonly<NavigationLinkProps>): ReactNode {
	const { children, href } = props;

	return (
		<Suspense
			fallback={
				<Link className="block aria-[current]:underline" href={href}>
					{children}
				</Link>
			}
		>
			<CurrentNavigationLink href={href}>{children}</CurrentNavigationLink>
		</Suspense>
	);
}
