"use client";

import type { ReactNode } from "react";

import { Link } from "@/components/link";
import type { IntlLocale } from "@/lib/i18n/locales";
import { createHref } from "@/lib/navigation/create-href";
import { usePathname, useSearchParams } from "@/lib/navigation/navigation";

interface LocaleSwitcherLinkProps {
	children: ReactNode;
	locale: IntlLocale;
}

export function LocaleSwitcherLink(props: Readonly<LocaleSwitcherLinkProps>): ReactNode {
	const { children, locale } = props;

	const pathname = usePathname();
	const searchParams = useSearchParams();

	return (
		<Link
			className="relative rounded-0.5 focus-visible:focus-outline"
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
			className="relative rounded-0.5 focus-visible:focus-outline"
			href={createHref({ pathname })}
			locale={locale}
			replace={true}
		>
			{children}
		</Link>
	);
}
