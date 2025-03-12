"use cache";

import { HttpError, request } from "@acdh-oeaw/lib";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/ui/main-content";
import { createImprintUrl } from "@/config/imprint.config";
import type { IntlLocale } from "@/lib/i18n/locales";

interface ImprintPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: Readonly<ImprintPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "ImprintPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function ImprintPage(props: Readonly<ImprintPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("ImprintPage");

	const html = await getImprintHtml(locale);

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid bg-fill-weaker xs:py-20 relative grid gap-y-6 py-16">
				<div className="max-w-text grid gap-y-4">
					<h1 className="font-heading text-heading-1 font-strong text-text-strong text-balance">
						{t("title")}
					</h1>
				</div>
			</section>

			<section
				dangerouslySetInnerHTML={{ __html: html }}
				className="layout-subgrid typography content-max-w-text border-stroke-weak xs:py-20 relative border-t py-16"
			/>
		</MainContent>
	);
}

async function getImprintHtml(locale: IntlLocale): Promise<string> {
	try {
		const url = createImprintUrl(locale);
		const html = await request(url, { responseType: "text" });

		return html;
	} catch (error) {
		if (error instanceof HttpError && error.response.status === 404) {
			notFound();
		}

		throw error;
	}
}
