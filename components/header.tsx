import type { ReactNode } from "react";

import { Link } from "#/components/link.tsx";
import { LocaleSwitcher } from "#/components/locale-switcher/locale-switcher.tsx";
import { MainNavigation } from "#/components/navigation/main-navigation.tsx";
import type { Locale } from "#/lib/i18n/locales.ts";
import { getSiteMetadata } from "#/lib/metadata/site-metadata.ts";

interface HeaderProps {
	locale: Locale;
}

export async function Header(props: Readonly<HeaderProps>): Promise<ReactNode> {
	const { locale } = props;

	const meta = await getSiteMetadata(locale);

	return (
		<header className="flex flex-wrap items-center justify-between gap-4 p-4">
			<Link href="/">{meta.title}</Link>
			<MainNavigation locale={locale} />
			<LocaleSwitcher />
		</header>
	);
}
