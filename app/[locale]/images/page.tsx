import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { ImageGrid } from "@/app/[locale]/images/_components/image-grid";
import { UploadImageForm } from "@/app/[locale]/images/_components/upload-image-form";
import { LoadingIndicator } from "@/components/loading-indicator";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";

interface ImagesPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<ImagesPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const t = await getTranslations({ locale, namespace: "ImagesPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function ImagesPage(props: Readonly<ImagesPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = await getTranslations("ImagesPage");

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-24">
				<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
					{t("title")}
				</h1>
			</section>

			<section className="layout-subgrid relative border-t border-stroke-weak py-16 xs:py-24">
				<UploadImageForm />
			</section>

			<section className="layout-subgrid relative border-t border-stroke-weak bg-fill-weaker py-16 xs:py-24">
				<Suspense fallback={<LoadingIndicator />}>
					{/* @ts-expect-error Fixed with react 19 types. */}
					<ImageGrid />
				</Suspense>
			</section>
		</MainContent>
	);
}
