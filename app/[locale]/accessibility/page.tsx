import type { Metadata } from "next";
import { useExtracted as useTranslations } from "next-intl";
import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "#/components/main-content.tsx";
import { createPageMetadata } from "#/lib/metadata/create-page-metadata.ts";
import { href } from "#/lib/navigation/href.ts";

interface AccessibilityPageProps extends PageProps<"/[locale]/accessibility"> {}

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations();

	return createPageMetadata({ href: href({ pathname: "/accessibility" }), title: t("Accessibility statement") });
}

export default function AccessibilityPage(_props: Readonly<AccessibilityPageProps>): ReactNode {
	const t = useTranslations();

	return (
		<MainContent>
			<h1>{t("Accessibility statement")}</h1>
		</MainContent>
	);
}
