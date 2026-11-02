import { clsx } from "clsx/lite";
import type { ReactNode } from "react";
import { isRTL } from "react-aria-components/I18nProvider";

import { Providers } from "#/components/providers.tsx";
import type { Locale } from "#/lib/i18n/locales.ts";
import { firaCode, notoSans } from "#/styles/fonts.ts";

interface HtmlDocumentProps {
	children: ReactNode;
	locale: Locale;
}

export function HtmlDocument(props: Readonly<HtmlDocumentProps>): ReactNode {
	const { children, locale } = props;

	return (
		<html className={clsx(notoSans.variable, firaCode.variable)} dir={isRTL(locale) ? "rtl" : "ltr"} lang={locale}>
			<body>
				<Providers locale={locale}>{children}</Providers>
			</body>
		</html>
	);
}
