import type { Metadata } from "next";
import { useExtracted as useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { MainContent } from "#/components/main-content.tsx";
import { createPageMetadata } from "#/lib/metadata/create-page-metadata.ts";

interface IndexPageProps extends PageProps<"/[locale]"> {}

export async function generateMetadata(): Promise<Metadata> {
	return createPageMetadata({ href: "/" });
}

export default function IndexPage(_props: Readonly<IndexPageProps>): ReactNode {
	const t = useTranslations();

	return (
		<MainContent>
			<h1>{t("Hello, World!")}</h1>
		</MainContent>
	);
}
