import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { NavigationLink } from "#/components/navigation/navigation-link.tsx";
import type { Locale } from "#/lib/i18n/locales.ts";
import { getMainNavigation } from "#/lib/navigation/main-navigation.ts";

interface MainNavigationProps {
	locale: Locale;
}

export async function MainNavigation(props: Readonly<MainNavigationProps>): Promise<ReactNode> {
	const { locale } = props;

	const t = await getTranslations({ locale });
	const items = await getMainNavigation(locale);

	return (
		<nav aria-label={t("Main")}>
			<ul className="flex flex-wrap gap-4">
				{items.map((item) => {
					return (
						<li key={item.href}>
							<NavigationLink href={item.href}>{item.label}</NavigationLink>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
