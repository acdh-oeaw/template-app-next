"use client";

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { I18nProvider as RacI18nProvider, RouterProvider } from "react-aria-components";

import type { IntlLocale } from "@/lib/i18n/locales";
import type { IntlMessages } from "@/lib/i18n/messages";
import { useRouter } from "@/lib/i18n/navigation";

interface ProvidersProps {
	children: ReactNode;
	locale: IntlLocale;
	messages: Partial<IntlMessages>;
}

export function Providers(props: Readonly<ProvidersProps>): ReactNode {
	const { children, locale, messages } = props;

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<RacI18nProvider locale={locale}>
				<RacRouterProvider>{children}</RacRouterProvider>
			</RacI18nProvider>
		</NextIntlClientProvider>
	);
}

interface RacRouterProviderProps {
	children: ReactNode;
}

function RacRouterProvider(props: Readonly<RacRouterProviderProps>): ReactNode {
	const { children } = props;

	const router = useRouter();

	return <RouterProvider navigate={router.push}>{children}</RouterProvider>;
}
