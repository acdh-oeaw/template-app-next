"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import type { Locale } from "@/config/i18n.config";
import { createHref } from "@/lib/create-href";
import { usePathname } from "@/lib/navigation";

interface LocaleSwitcherLinkProps {
	children: ReactNode;
	locale: Locale;
}

export function LocaleSwitcherLink(props: LocaleSwitcherLinkProps): ReactNode {
	const { children, locale } = props;

	const pathname = usePathname();
	const searchParams = useSearchParams();

	return (
		<Link href={createHref({ pathname, searchParams })} locale={locale}>
			{children}
		</Link>
	);
}

export function LocaleSwitcherLinkFallback(props: LocaleSwitcherLinkProps): ReactNode {
	const { children, locale } = props;

	const pathname = usePathname();

	return (
		<Link href={createHref({ pathname })} locale={locale}>
			{children}
		</Link>
	);
}
