import type { Metadata } from "next";
import { useExtracted as useTranslations } from "next-intl";
import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations();

	return { title: t("Page not found") };
}

export default function NotFoundPage(): ReactNode {
	const t = useTranslations();

	return (
		<main>
			<h1>{t("Page not found")}</h1>
		</main>
	);
}
