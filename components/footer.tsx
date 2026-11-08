import { useExtracted as useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ColorSchemeSwitcher } from "#/components/color-scheme/color-scheme-switcher.tsx";
import { Link } from "#/components/link.tsx";

export function Footer(): ReactNode {
	const t = useTranslations();

	return (
		<footer className="flex items-center justify-between gap-4 p-4">
			<Link href="/imprint">{t("Imprint")}</Link>
			<ColorSchemeSwitcher />
		</footer>
	);
}
