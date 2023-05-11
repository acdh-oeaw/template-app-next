import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { type LinkProps } from "@/components/link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { NavLink } from "@/components/nav-link";

export function AppHeader(): ReactNode {
	const t = useTranslations("AppHeader");

	const links = {
		home: { href: { pathname: "/" }, label: t("links.home") },
	} satisfies Record<string, { href: LinkProps["href"]; label: string }>;

	return (
		<header className="border-b border-neutral-200">
			<div className="container flex items-center justify-between gap-4 py-8">
				<nav aria-label={t("navigation-primary")}>
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

				<LocaleSwitcher />
			</div>
		</header>
	);
}
