import type { Metadata, ResolvingMetadata } from "next";
import { unstable_setRequestLocale as setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/ui/page-title";
import type { Locale } from "@/config/i18n.config";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface DocumentationPageProps {
	params: {
		id: string;
		locale: Locale;
	};
}

export const dynamicParams = false;

export async function generateStaticParams(props: {
	params: Pick<DocumentationPageProps["params"], "locale">;
}): Promise<Array<Pick<DocumentationPageProps["params"], "id">>> {
	const { params } = props;

	const { locale } = params;

	const ids = await createCollectionResource("documentation", locale).list();

	return ids.map((id) => {
		/** @see https://github.com/vercel/next.js/issues/63002 */
		return { id: process.env.NODE_ENV === "production" ? id : encodeURIComponent(id) };
	});
}

export async function generateMetadata(
	props: DocumentationPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const id = decodeURIComponent(params.id);

	const entry = await createCollectionResource("documentation", locale).read(id);
	const { title } = entry.data;

	const metadata: Metadata = {
		title,
	};

	return metadata;
}

export default async function DocumentationPage(props: DocumentationPageProps): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;
	const id = decodeURIComponent(params.id);

	setRequestLocale(locale);

	const entry = await createCollectionResource("documentation", locale).read(id);
	const { content, title } = entry.data;
	const { default: Content } = await entry.compile(content);

	return (
		<MainContent className="container py-8">
			<PageTitle>{title}</PageTitle>
			<div className="prose">
				<Content />
			</div>
		</MainContent>
	);
}
