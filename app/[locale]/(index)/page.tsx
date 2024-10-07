import type { Metadata, ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, unstable_setRequestLocale as setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";

interface IndexPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: IndexPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const _t = await getTranslations({ locale, namespace: "IndexPage" });

	const metadata: Metadata = {
		/**
		 * Fall back to `title.default` from `layout.tsx`.
		 *
		 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#title
		 */
		// title: undefined,
	};

	return metadata;
}

export default function IndexPage(props: IndexPageProps): ReactNode {
	const { params } = props;

	const { locale } = params;
	setRequestLocale(locale);

	const t = useTranslations("IndexPage");

	return (
		<MainContent className="container py-8">
			<section className="mx-auto grid w-full max-w-screen-lg items-start justify-items-center gap-3 px-4 py-8 text-center md:py-12">
				<div className="rounded-lg bg-muted text-sm font-medium flex items-center gap-2 px-3 py-1 leading-tight">
					<Logo className="size-4 shrink-0" />
					<span>{t("badge")}</span>
				</div>
				<h1 className="text-3xl font-bold md:text-5xl lg:text-6xl text-balance leading-tight tracking-tighter">
					{t("title")}
				</h1>
				<div className="text-lg text-on-muted sm:text-xl mx-auto w-full max-w-screen-md text-pretty">
					{t("lead-in")}
				</div>
			</section>
		</MainContent>
	);
}
