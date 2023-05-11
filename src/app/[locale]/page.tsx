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
	const _t = await getTranslator(locale, "IndexPage");

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

export default function IndexPage(_props: Props): ReactNode {
	const t = useTranslations("IndexPage");

	return (
		<MainContent className="container py-8">
			<h1>{t("title")}</h1>
		</MainContent>
	);
}
