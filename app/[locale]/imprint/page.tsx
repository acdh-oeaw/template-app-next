import type { Metadata } from "next";
import { useExtracted as useTranslations } from "next-intl";
import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "#/components/main-content.tsx";
import { createPageMetadata } from "#/lib/metadata/create-page-metadata.ts";
import { href } from "#/lib/navigation/href.ts";

interface ImprintPageProps extends PageProps<"/[locale]/imprint"> {}

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations();

	return createPageMetadata({ href: href({ pathname: "/imprint" }), title: t("Imprint") });
}

export default function ImprintPage(_props: Readonly<ImprintPageProps>): ReactNode {
	const t = useTranslations();

	return (
		<MainContent>
			<h1>{t("Imprint")}</h1>
		</MainContent>
	);
}
