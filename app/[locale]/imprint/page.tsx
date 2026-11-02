import type { Metadata } from "next";
import { useExtracted as useTranslations } from "next-intl";
import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { createPageMetadata } from "#/lib/metadata/create-page-metadata.ts";

interface ImprintPageProps extends PageProps<"/[locale]/imprint"> {}

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations();

	return createPageMetadata({ href: "/imprint", title: t("Imprint") });
}

export default function ImprintPage(_props: Readonly<ImprintPageProps>): ReactNode {
	const t = useTranslations();

	return (
		<main>
			<h1>{t("Imprint")}</h1>
		</main>
	);
}
