import type { ReactNode } from "react";

import { Footer } from "#/components/footer.tsx";
import { Header } from "#/components/header.tsx";
import { SkipLink } from "#/components/skip-link.tsx";
import type { Locale } from "#/lib/i18n/locales.ts";

interface AppShellProps {
	children: ReactNode;
	locale: Locale;
}

export function AppShell(props: Readonly<AppShellProps>): ReactNode {
	const { children, locale } = props;

	return (
		<div className="grid min-h-full grid-rows-[auto_1fr_auto]">
			<SkipLink />
			<Header locale={locale} />
			{children}
			<Footer />
		</div>
	);
}
