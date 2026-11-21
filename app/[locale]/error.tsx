"use client";

import { useExtracted as useTranslations } from "next-intl";
import type { ErrorInfo } from "next/error";
import type { ReactNode } from "react";

import { ErrorFallback } from "#/components/error/error-fallback.tsx";
import { MainContent } from "#/components/main-content.tsx";

export default function ErrorPage(props: Readonly<ErrorInfo>): ReactNode {
	const { error, retry } = props;

	const t = useTranslations();

	return (
		<MainContent>
			{/* Error boundaries are client components, which cannot export metadata. */}
			<title>{t("Something went wrong")}</title>
			<ErrorFallback error={error} retry={retry}>
				<h1>{t("Something went wrong")}</h1>
			</ErrorFallback>
		</MainContent>
	);
}
