"use client";

import { pick } from "@acdh-oeaw/lib";
import { useParams } from "next/navigation";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { type ReactNode, use } from "react";

import { MainContent } from "@/components/main-content";
import { defaultLocale, type Locale } from "~/config/i18n.config";

interface ErrorProps {
	error: Error;
	reset: () => void;
}

export default function Error(props: ErrorProps): ReactNode {
	const params = useParams();
	const locale = (params.locale ?? defaultLocale) as Locale;
	// const locale = useLocale() as Locale;
	const messages = use(import(`@/messages/${locale}.json`)).default;

	return (
		<html lang={locale}>
			<body>
				<NextIntlClientProvider locale={locale} messages={pick(messages, ["Error"])}>
					<ErrorMessage {...props} />
				</NextIntlClientProvider>
			</body>
		</html>
	);
}

function ErrorMessage(props: ErrorProps): ReactNode {
	const { reset } = props;

	const t = useTranslations("Error");

	return (
		<MainContent className="container py-8">
			<h1>{t("something-went-wrong")}</h1>
			<button onClick={reset}>{t("try-again")}</button>
		</MainContent>
	);
}
