import { useExtracted as useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { mainContentId } from "#/components/main-content.tsx";

export function SkipLink(): ReactNode {
	const t = useTranslations();

	return (
		<a
			className="not-focus:sr-only focus:fixed focus:inset-s-2 focus:inset-bs-2 focus:z-50 focus:bg-canvas focus:p-2 focus:text-canvas-text"
			href={`#${mainContentId}`}
		>
			{t("Skip to main content")}
		</a>
	);
}
