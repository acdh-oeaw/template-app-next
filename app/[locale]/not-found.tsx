import { useExtracted as useTranslations } from "next-intl";
import type { ReactNode } from "react";

export default function NotFoundPage(): ReactNode {
	const t = useTranslations();

	return (
		<main>
			<h1>{t("Page not found")}</h1>
		</main>
	);
}
