"use client";

import "#/styles/index.css";

import { type AbstractIntlMessages, NextIntlClientProvider, useExtracted as useTranslations } from "next-intl";
import type { ErrorInfo } from "next/error";
import { type ReactNode, Suspense, use } from "react";

import { ErrorFallback } from "#/components/error/error-fallback.tsx";
import { HtmlDocument } from "#/components/html-document.tsx";
import { MainContent } from "#/components/main-content.tsx";
import { defaultLocale } from "#/lib/i18n/locales.ts";
import { getMessages } from "#/lib/i18n/messages.ts";

/** Replaces the root layout, so it receives no params, and renders in the default locale. */
const locale = defaultLocale;

let messages: Promise<AbstractIntlMessages> | undefined;

/** Loaded on first render, so pages without errors don't load the messages again. */
function getDefaultMessages(): Promise<AbstractIntlMessages> {
	messages ??= getMessages(locale);

	return messages;
}

export default function GlobalErrorPage(props: Readonly<ErrorInfo>): ReactNode {
	const { error, retry } = props;

	return (
		<HtmlDocument locale={locale}>
			<Suspense fallback={null}>
				<GlobalErrorContent error={error} retry={retry} />
			</Suspense>
		</HtmlDocument>
	);
}

interface GlobalErrorContentProps extends Pick<ErrorInfo, "error" | "retry"> {}

function GlobalErrorContent(props: Readonly<GlobalErrorContentProps>): ReactNode {
	const { error, retry } = props;

	return (
		<NextIntlClientProvider locale={locale} messages={use(getDefaultMessages())}>
			<GlobalErrorMain error={error} retry={retry} />
		</NextIntlClientProvider>
	);
}

function GlobalErrorMain(props: Readonly<GlobalErrorContentProps>): ReactNode {
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
