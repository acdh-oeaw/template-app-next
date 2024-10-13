import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/[locale]/_actions/sign-out-action";
import { AppNavLink } from "@/components/app-nav-link";
import { ColorSchemeSwitcher } from "@/components/color-scheme-switcher";
import { Form } from "@/components/form";
import { Link, type LinkProps } from "@/components/link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getCurrentUser } from "@/lib/auth";
import { createHref } from "@/lib/create-href";

export function AppHeader(): ReactNode {
	const t = useTranslations("AppHeader");

	const links = {
		home: { href: createHref({ pathname: "/" }), label: t("links.home") },
	} satisfies Record<string, { href: LinkProps["href"]; label: string }>;

	return (
		<header className="border-b">
			<div className="container flex items-center justify-between gap-4 py-6">
				<nav aria-label={t("navigation-primary")}>
					<ul className="flex items-center gap-4 text-sm" role="list">
						{Object.entries(links).map(([id, link]) => {
							return (
								<li key={id}>
									<AppNavLink href={link.href}>{link.label}</AppNavLink>
								</li>
							);
						})}
					</ul>
				</nav>

				<div className="flex items-center gap-4">
					<ColorSchemeSwitcher />
					<LocaleSwitcher />
					{/* @ts-expect-error @see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/69970 */}
					<AuthMenu />
				</div>
			</div>
		</header>
	);
}

async function AuthMenu(): Promise<ReactNode> {
	const t = await getTranslations("AppHeader");

	const user = await getCurrentUser();

	if (user == null) {
		return (
			<div>
				<Link href="/auth/sign-in">{t("sign-in")}</Link>
			</div>
		);
	}

	return (
		<div>
			<div>{user.email}</div>
			<Form action={signOutAction}>
				<button type="submit">{t("sign-out")}</button>
			</Form>
		</div>
	);
}
