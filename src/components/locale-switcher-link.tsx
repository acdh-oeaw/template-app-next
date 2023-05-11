"use client";

import { usePathname } from "next-intl/client";
import { type ReactNode } from "react";

import { Link } from "@/components/link";
import { type Locale } from "~/config/i18n.config";

interface LocaleSwitcherLinkProps {
	children: ReactNode;
	locale: Locale;
}

export function LocaleSwitcherLink(props: LocaleSwitcherLinkProps): ReactNode {
	const { children, locale } = props;

	const pathname = usePathname();

	return (
		<Link href={{ pathname }} locale={locale}>
			{children}
		</Link>
	);
}
