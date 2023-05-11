import { HttpError, request } from "@acdh-oeaw/lib";
import { type Metadata, type ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getTranslator } from "next-intl/server";
import { type ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { type Locale } from "~/config/i18n.config";
import { createImprintUrl } from "~/config/imprint.config";

interface Props {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Props,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { locale } = props.params;
	const t = await getTranslator(locale, "ImprintPage");

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default function ImprintPage(_props: Props): ReactNode {
	const t = useTranslations("ImprintPage");

	return (
		<MainContent className="container py-8">
			<h1>{t("title")}</h1>
			<Imprint />
		</MainContent>
	);
}

async function Imprint(): Promise<ReactNode> {
	const locale = useLocale() as Locale;

	const html = await getImprintHtml(locale);

	return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

async function getImprintHtml(locale: Locale): Promise<string> {
	try {
		const url = createImprintUrl(locale);
		const html = await request(url, { responseType: "text" });

		return html as string;
	} catch (error) {
		if (error instanceof HttpError && error.response.status === 404) {
			notFound();
		}

		throw error;
	}
}
