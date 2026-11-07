"use client";

import { useExtracted as useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";

interface ErrorPageProps {
	error: unknown;
	retry: () => void;
}

export default function ErrorPage(props: Readonly<ErrorPageProps>): ReactNode {
	const { retry } = props;

	const t = useTranslations();

	return (
		<Fragment>
			<title>{t("Something went wrong")}</title>
			<h1>{t("Something went wrong")}</h1>
			<button
				onClick={() => {
					retry();
				}}
				type="button"
			>
				{t("Try again")}
			</button>
		</Fragment>
	);
}
