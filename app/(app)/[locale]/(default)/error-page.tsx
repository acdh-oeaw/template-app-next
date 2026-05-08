"use client";

import { log } from "@acdh-oeaw/lib";
import * as Sentry from "@sentry/nextjs";
import { useExtracted } from "next-intl";
import { type ReactNode, useEffect } from "react";

import { Main } from "#/components/main";

interface ErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export function ErrorPage(props: Readonly<ErrorPageProps>): ReactNode {
	const { error, reset } = props;

	const t = useExtracted();

	useEffect(() => {
		log.error(error);
		Sentry.captureException(error);
	}, [error]);

	return (
		<Main>
			<h1>{t("Something went wrong")}</h1>
			<button
				onClick={() => {
					reset();
				}}
				type="button"
			>
				{t("Try again")}
			</button>
		</Main>
	);
}
