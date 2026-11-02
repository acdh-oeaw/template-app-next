import { NextIntlClientProvider } from "next-intl";
import { Fragment, type ReactNode } from "react";
import { LocalizedStringProvider } from "react-aria-components/i18n";

import type { Locale } from "#/lib/i18n/locales.ts";

interface ProvidersProps {
	children: ReactNode;
	locale: Locale;
}

export function Providers(props: Readonly<ProvidersProps>): ReactNode {
	const { children, locale } = props;

	return (
		<Fragment>
			<LocalizedStringProvider locale={locale} />
			<NextIntlClientProvider>{children}</NextIntlClientProvider>
		</Fragment>
	);
}
