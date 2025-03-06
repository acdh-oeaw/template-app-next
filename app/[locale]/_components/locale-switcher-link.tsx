"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import type { Locale } from "@/config/i18n.config";
import { createHref } from "@/lib/create-href";
import { usePathname } from "@/lib/i18n/navigation";

interface LocaleSwitcherLinkProps {
	children: ReactNode;
	locale: Locale;
}

export function LocaleSwitcherLink(props: Readonly<LocaleSwitcherLinkProps>): ReactNode {
	const { children, locale } = props;

	const pathname = usePathname();
	const searchParams = useSearchParams();

	return (
		<Link
			className="rounded-0.5 focus-visible:focus-outline"
			href={createHref({ pathname, searchParams })}
			locale={locale}
			replace={true}
		>
			{children}
		</Link>
	);
}

export function LocaleSwitcherLinkFallback(props: Readonly<LocaleSwitcherLinkProps>): ReactNode {
	const { children, locale } = props;

	const pathname = usePathname();

	return (
		<Link
			className="rounded-0.5 focus-visible:focus-outline"
			href={createHref({ pathname })}
			locale={locale}
			replace={true}
		>
			{children}
		</Link>
	);
}
