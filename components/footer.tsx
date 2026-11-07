import { useExtracted as useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "#/lib/i18n/navigation.ts";

export function Footer(): ReactNode {
	const t = useTranslations();

	return (
		<footer className="p-4">
			<Link href="/imprint">{t("Imprint")}</Link>
		</footer>
	);
}
