import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/ui/main-content";
import { createClient } from "@/lib/content/create-client";
import type { IntlLocale } from "@/lib/i18n/locales";

interface DocumentationPageProps {
	params: Promise<{
		id: string;
		locale: IntlLocale;
	}>;
}

export const dynamicParams = false;

export async function generateStaticParams(props: {
	params: Pick<Awaited<DocumentationPageProps["params"]>, "locale">;
}): Promise<Array<Pick<Awaited<DocumentationPageProps["params"]>, "id">>> {
	const { params } = props;

	const { locale } = params;

	const client = await createClient(locale);
	const ids = await client.documentation.ids();

	return ids.map((id) => {
		return { id };
	});
}

export async function generateMetadata(
	props: Readonly<DocumentationPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { id: _id, locale } = await params;
	const id = decodeURIComponent(_id);

	const client = await createClient(locale);
	const entry = await client.documentation.get(id);
	const { title } = entry.data;

	const metadata: Metadata = {
		title,
	};

	return metadata;
}

export default async function DocumentationPage(
	props: Readonly<DocumentationPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { id: _id, locale } = await params;
	const id = decodeURIComponent(_id);

	setRequestLocale(locale);

	const client = await createClient(locale);
	const entry = await client.documentation.get(id);
	const { content, lead, title } = entry.data;
	const { default: Content } = await entry.compile(content);

	return (
		<MainContent className="layout-grid content-start">
			<section className="relative layout-subgrid bg-fill-weaker py-16 xs:py-20">
				<div className="grid max-w-text gap-y-4">
					<h1 className="font-heading text-heading-1 font-strong text-balance text-text-strong">
						{title}
					</h1>
					<p className="font-heading text-small text-text-weak xs:text-heading-4">{lead}</p>
				</div>
			</section>

			<section className="relative layout-subgrid typography content-max-w-text border-t border-stroke-weak py-16 xs:py-20">
				<Content />
			</section>
		</MainContent>
	);
}
