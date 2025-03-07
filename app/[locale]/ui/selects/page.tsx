import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/ui/main-content";
import type { Locale } from "@/config/i18n.config";

interface UiPageProps {
	params: Promise<{
		locale: Locale;
	}>;
}

export default async function UiPage(props: Readonly<UiPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	return (
		<MainContent className="layout-grid content-start">
			<section className="relative layout-subgrid bg-fill-weaker py-16 xs:py-24">
				<h1>Selects</h1>

				<div className="my-8 flex flex-wrap items-center gap-8"></div>
			</section>
		</MainContent>
	);
}
