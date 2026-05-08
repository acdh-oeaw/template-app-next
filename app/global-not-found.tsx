import type { Metadata } from "next";
import { useExtracted } from "next-intl";
import { getExtracted } from "next-intl/server";
import type { ReactNode } from "react";

import { DocumentBody } from "#/app/_components/document-body";
import { HtmlDocument } from "#/app/_components/html-document";
import { Providers } from "#/app/_components/providers";
import { Main } from "#/components/main";
import { defaultLocale } from "#/lib/i18n/locales";
import { getMetadata } from "#/lib/i18n/metadata";

export { viewport } from "#/app/_lib/viewport.config";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();
	const meta = await getMetadata();

	const metadata: Metadata = {
		title: [t("Page not found"), meta.title].join(" | "),
		/**
		 * Automatically set by next.js.
		 *
		 * @see {@link https://nextjs.org/docs/app/api-reference/functions/not-found}
		 */
		// robots: {
		// 	index: false,
		// },
	};

	return metadata;
}

export default function GlobalNotFoundPage(): ReactNode {
	const locale = defaultLocale;
	const t = useExtracted();

	return (
		<HtmlDocument locale={locale}>
			<DocumentBody>
				<Providers locale={locale}>
					<Main className="h-full grid place-items-center place-content-center">
						<h1>{t("Page not found")}</h1>
					</Main>
				</Providers>
			</DocumentBody>
		</HtmlDocument>
	);
}
