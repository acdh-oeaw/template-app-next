import { useExtracted as useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { MainContent } from "#/components/main-content.tsx";

export default function NotFoundPage(): ReactNode {
	const t = useTranslations();

	return (
		<MainContent>
			<h1>{t("Page not found")}</h1>
		</MainContent>
	);
}
