import "#/styles/index.css";

import type { Metadata } from "next";
import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { AppShell } from "#/components/app-shell.tsx";
import { HtmlDocument } from "#/components/html-document.tsx";
import { MainContent } from "#/components/main-content.tsx";
import { defaultLocale } from "#/lib/i18n/locales.ts";
import { getSiteMetadata } from "#/lib/metadata/site-metadata.ts";

export { viewport } from "#/lib/metadata/viewport.ts";

/**
 * Also renders for unmatched urls below a locale prefix, like `/de/does-not-exist`, but receives no params. Reading the
 * locale from a request header instead would make every route partially dynamic.
 */
const locale = defaultLocale;

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations({ locale });
	const meta = await getSiteMetadata(locale);

	return {
		title: `${t("Page not found")} | ${meta.title}`,
	};
}

export default async function GlobalNotFoundPage(): Promise<ReactNode> {
	const t = await getTranslations({ locale });

	return (
		<HtmlDocument locale={locale}>
			<AppShell locale={locale}>
				<MainContent>
					<h1>{t("Page not found")}</h1>
				</MainContent>
			</AppShell>
		</HtmlDocument>
	);
}
