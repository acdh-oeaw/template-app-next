import "#/styles/index.css";

import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { HtmlDocument } from "#/components/html-document.tsx";
import { defaultLocale } from "#/lib/i18n/locales.ts";

export { viewport } from "#/lib/metadata/viewport.ts";

export default async function GlobalNotFoundPage(): Promise<ReactNode> {
	const locale = defaultLocale;

	const t = await getTranslations({ locale });

	return (
		<HtmlDocument locale={locale}>
			<main>
				<h1>{t("Page not found")}</h1>
			</main>
		</HtmlDocument>
	);
}
