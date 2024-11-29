import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { AccountMenu } from "@/app/[locale]/_components/account-menu";
import {
	AppNavigation,
	AppNavigationMobile,
	type NavigationItem,
} from "@/app/[locale]/_components/app-navigation";
import { AuthButtonGroup } from "@/app/[locale]/_components/auth-button-group";
import { ColorSchemeSwitcher } from "@/app/[locale]/_components/color-scheme-switcher";
import { LocaleSwitcher } from "@/app/[locale]/_components/locale-switcher";
import { createHref } from "@/lib/create-href";
import { getCurrentSession } from "@/lib/server/auth/sessions";

export async function AppHeader(): Promise<ReactNode> {
	const t = await getTranslations("AppHeader");

	const label = t("navigation-primary");

	const navigation = {
		home: {
			type: "link",
			href: createHref({ pathname: "/" }),
			label: t("links.home"),
		},
		about: {
			type: "link",
			href: createHref({ pathname: "/about" }),
			label: t("links.about"),
		},
	} satisfies Record<string, NavigationItem>;

	const { user } = await getCurrentSession();

	return (
		<header className="layout-grid border-b border-stroke-weak bg-fill-weaker">
			<div className="flex justify-between gap-x-12">
				<AppNavigation label={label} navigation={navigation} />
				<AppNavigationMobile
					label={label}
					menuCloseLabel={t("navigation-menu-close")}
					menuOpenLabel={t("navigation-menu-open")}
					menuTitleLabel={t("navigation-menu")}
					navigation={navigation}
				/>

				<div className="flex items-center gap-x-6">
					<ColorSchemeSwitcher />
					<LocaleSwitcher />
					{user != null ? <AccountMenu user={user} /> : <AuthButtonGroup />}
				</div>
			</div>
		</header>
	);
}
