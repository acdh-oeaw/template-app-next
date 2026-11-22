import type { Metadata } from "next";
import { getLocale, getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "#/components/main-content.tsx";
import { getImprint } from "#/lib/imprint/get-imprint.ts";
import { createPageMetadata } from "#/lib/metadata/create-page-metadata.ts";
import { href } from "#/lib/navigation/href.ts";

interface ImprintPageProps extends PageProps<"/[locale]/imprint"> {}

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations();

	return createPageMetadata({ href: href({ pathname: "/imprint" }), title: t("Imprint") });
}

export default async function ImprintPage(_props: Readonly<ImprintPageProps>): Promise<ReactNode> {
	const t = await getTranslations();
	const locale = await getLocale();

	const imprint = await getImprint(locale);

	return (
		<MainContent>
			<h1>{t("Imprint")}</h1>
			<div dangerouslySetInnerHTML={{ __html: imprint }} />
		</MainContent>
	);
}
