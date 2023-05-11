import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { LinkProps } from "@/components/link";
import { NavLink } from "@/components/nav-link";
import { createHref } from "@/lib/create-href";

export function AppFooter(): ReactNode {
	const t = useTranslations("AppFooter");

	const links = {
		imprint: { href: createHref({ pathname: "/imprint" }), label: t("links.imprint") },
	} satisfies Record<string, { href: LinkProps["href"]; label: string }>;

	return (
		<footer className="border-t">
			<div className="container flex items-center justify-between gap-4 py-8">
				<nav aria-label={t("navigation-secondary")}>
					<ul className="flex items-center gap-4" role="list">
						{Object.entries(links).map(([key, link]) => {
							return (
								<li key={key}>
									<NavLink href={link.href}>{link.label}</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>
		</footer>
	);
}
