import "#/styles/index.css";

import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Footer } from "#/components/footer.tsx";
import { Header } from "#/components/header.tsx";
import { HtmlDocument } from "#/components/html-document.tsx";
import { SkipLink } from "#/components/skip-link.tsx";
import { env } from "#/lib/env/public.ts";
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
		metadataBase: env.NEXT_PUBLIC_APP_BASE_URL,
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

	return (
		<HtmlDocument locale={locale}>
			<div className="grid min-h-full grid-rows-[auto_1fr_auto]">
				<SkipLink />
				<Header locale={locale} />
				{children}
				<Footer />
			</div>
		</HtmlDocument>
	);
}
