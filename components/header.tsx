import type { ReactNode } from "react";

import type { Locale } from "#/lib/i18n/locales.ts";
import { Link } from "#/lib/i18n/navigation.ts";
import { getSiteMetadata } from "#/lib/metadata/site-metadata.ts";

interface HeaderProps {
	locale: Locale;
}

export async function Header(props: Readonly<HeaderProps>): Promise<ReactNode> {
	const { locale } = props;

	const meta = await getSiteMetadata(locale);

	return (
		<header className="flex items-center justify-between gap-4 p-4">
			<Link href="/">{meta.title}</Link>
		</header>
	);
}
