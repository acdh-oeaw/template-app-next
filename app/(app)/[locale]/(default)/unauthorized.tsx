import type { Metadata } from "next";
import { useExtracted } from "next-intl";
import { getExtracted } from "next-intl/server";
import type { ReactNode } from "react";

import { Main } from "#/components/main";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();

	const metadata: Metadata = {
		title: t("Unauthorized"),
		/**
		 * Automatically set by next.js.
		 *
		 * @see {@link https://nextjs.org/docs/app/api-reference/functions/unauthorized}
		 */
		// robots: {
		// 	index: false,
		// },
	};

	return metadata;
}

export default function UnauthorizedPage(): ReactNode {
	const t = useExtracted();

	return (
		<Main className="flex-1">
			<h1 className="px-2 text-3xl font-semibold tracking-tight text-text-strong">{t("Unauthorized")}</h1>
		</Main>
	);
}
