import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { AppFooter } from "@/app/(app)/[locale]/(default)/_components/app-footer";
import { AppHeader } from "@/app/(app)/[locale]/(default)/_components/app-header";
import { AppLayout } from "@/app/(app)/[locale]/(default)/_components/app-layout";
import type { IntlLocale } from "@/lib/i18n/locales";

interface DefaultLayoutProps {
	children: ReactNode;
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export default async function DefaultLayout(
	props: Readonly<DefaultLayoutProps>,
): Promise<ReactNode> {
	const { children, params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	return (
		<AppLayout>
			<AppHeader />
			{children}
			<AppFooter />
		</AppLayout>
	);
}
