import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ColorSchemeSwitcher } from "#/components/color-scheme-switcher.tsx";
import { LocaleSwitcher } from "#/components/locale-switcher.tsx";
import { NavLink } from "#/components/nav-link.tsx";

export async function AppHeader(): Promise<ReactNode> {
	const t = await getTranslations();

	return (
		<header className="flex flex-wrap items-center justify-between gap-4 p-4">
			<a className="sr-only focus:not-sr-only" href="#main-content">
				{t("Skip to main content")}
			</a>
			<nav aria-label={t("Main")}>
				<ul className="flex gap-4">
					<li>
						<NavLink className="aria-[current]:font-bold" href="/">
							{t("Home")}
						</NavLink>
					</li>
					<li>
						<NavLink className="aria-[current]:font-bold" href="/imprint">
							{t("Imprint")}
						</NavLink>
					</li>
				</ul>
			</nav>
			<div className="flex flex-wrap items-center gap-4">
				<LocaleSwitcher />
				<ColorSchemeSwitcher />
			</div>
		</header>
	);
}
