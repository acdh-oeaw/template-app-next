import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { exampleAction } from "@/app/[locale]/_client-actions/navigation";
import { AppNavigation, AppNavigationMobile } from "@/app/[locale]/_components/app-navigation";
import { ColorSchemeSwitcher } from "@/app/[locale]/_components/color-scheme-switcher";
import { LocaleSwitcher } from "@/app/[locale]/_components/locale-switcher";
import { createHref } from "@/lib/navigation/create-href";
import type { NavigationItem } from "@/lib/navigation/navigation";

export function AppHeader(): ReactNode {
	const t = useTranslations("AppHeader");

	const label = t("navigation.label");

	const navigation = {
		home: {
			type: "link",
			href: createHref({ pathname: "/" }),
			label: t("navigation.items.home"),
		},
		about: {
			type: "link",
			href: createHref({ pathname: "/about" }),
			label: t("navigation.items.about"),
		},
		documentation: {
			type: "menu",
			label: t("navigation.items.documentation"),
			children: {
				about: {
					type: "link",
					href: createHref({ pathname: "/about" }),
					label: t("navigation.items.about"),
				},
				example: {
					type: "action",
					onAction: exampleAction,
					label: t("navigation.items.example"),
				},
			},
		},
	} satisfies Record<string, NavigationItem>;

	return (
		<header className="layout-grid border-b border-stroke-weak bg-fill-weaker">
			<div className="flex justify-between gap-x-12">
				<AppNavigation label={label} navigation={navigation} />
				<AppNavigationMobile
					drawerCloseLabel={t("navigation.drawer.close")}
					drawerLabel={t("navigation.drawer.label")}
					drawerOpenLabel={t("navigation.drawer.open")}
					label={label}
					navigation={navigation}
				/>

				<div className="flex items-center gap-x-6">
					<ColorSchemeSwitcher />
					<LocaleSwitcher />
				</div>
			</div>
		</header>
	);
}
