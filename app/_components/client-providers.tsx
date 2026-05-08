"use client";

import { ToastRegion } from "@dariah-eric/ui/toast";
import type { ReactNode } from "react";
import { I18nProvider as AriaI18nProvider } from "react-aria-components";

import type { IntlLocale } from "#/lib/i18n/locales";

interface ClientProvidersProps {
	children: ReactNode;
	locale: IntlLocale;
}

export function ClientProviders(props: Readonly<ClientProvidersProps>): ReactNode {
	const { children, locale } = props;

	return (
		<AriaI18nProvider locale={locale}>
			{children}
			<ToastRegion />
		</AriaI18nProvider>
	);
}
