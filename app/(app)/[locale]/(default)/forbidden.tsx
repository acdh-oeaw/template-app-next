import type { Metadata } from "next";
import { useExtracted } from "next-intl";
import { getExtracted } from "next-intl/server";
import type { ReactNode } from "react";

import { Main } from "#/components/main";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();

	const metadata: Metadata = {
		title: t("Forbidden"),
		/**
		 * Automatically set by next.js.
		 *
		 * @see {@link https://nextjs.org/docs/app/api-reference/functions/forbidden}
		 */
		// robots: {
		// 	index: false,
		// },
	};

	return metadata;
}

export default function ForbiddenPage(): ReactNode {
	const t = useExtracted();

	return (
		<Main className="flex-1">
			<h1 className="px-2 text-3xl font-semibold tracking-tight text-text-strong">{t("Forbidden")}</h1>
		</Main>
	);
}
