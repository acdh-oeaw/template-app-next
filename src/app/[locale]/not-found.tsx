import { type Metadata, type ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslator } from "next-intl/server";
import { type ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { type Locale } from "~/config/i18n.config";

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
	const t = await getTranslator(locale, "NotFoundPage");

	const metadata: Metadata = {
		title: t("meta.title"),
		robots: {
			follow: false,
			index: false,
		},
	};

	return metadata;
}

export default function NotFoundPage(_props: Props): ReactNode {
	const t = useTranslations("NotFoundPage");

	return (
		<MainContent className="container py-8">
			<h1>{t("title")}</h1>
		</MainContent>
	);
}
