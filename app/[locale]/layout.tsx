import "#/styles/index.css";

import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { HtmlDocument } from "#/components/html-document.tsx";
import { routing } from "#/lib/i18n/routing.ts";
import { getDefaultOpenGraph } from "#/lib/metadata/create-page-metadata.ts";
import { getSiteMetadata } from "#/lib/metadata/site-metadata.ts";

export { viewport } from "#/lib/metadata/viewport.ts";

interface LocaleLayoutProps extends LayoutProps<"/[locale]"> {}

export function generateStaticParams(): Array<{ locale: string }> {
	return routing.locales.map((locale) => {
		return { locale };
	});
}

export async function generateMetadata(props: Omit<Readonly<LocaleLayoutProps>, "children">): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	const meta = await getSiteMetadata(locale);

	return {
		metadataBase: process.env.NEXT_PUBLIC_APP_BASE_URL,
		title: {
			default: meta.title,
			template: `%s | ${meta.title}`,
		},
		description: meta.description,
		openGraph: getDefaultOpenGraph(meta, locale),
	};
}

export default async function LocaleLayout(props: Readonly<LocaleLayoutProps>): Promise<ReactNode> {
	const { children, params } = props;

	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	return <HtmlDocument locale={locale}>{children}</HtmlDocument>;
}
