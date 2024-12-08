import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import type { Locale } from "@/config/i18n.config";

interface SearchLayoutProps {
	children: ReactNode;
	params: {
		locale: Locale;
	};
}

export default async function SearchLayout(props: Readonly<SearchLayoutProps>): Promise<ReactNode> {
	const { children, params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	return children;
}
