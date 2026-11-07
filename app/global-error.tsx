"use client";

import "#/styles/index.css";

import { clsx } from "clsx/lite";
import type { ReactNode } from "react";

import { defaultLocale } from "#/lib/i18n/locales.ts";
import { firaCode, notoSans } from "#/styles/fonts.ts";

interface GlobalErrorPageProps {
	error: unknown;
	retry: () => void;
}

/** Replaces the root layout, so there is no locale or translations: always renders in the default locale. */
export default function GlobalErrorPage(props: Readonly<GlobalErrorPageProps>): ReactNode {
	const { retry } = props;

	return (
		<html className={clsx(notoSans.variable, firaCode.variable)} dir="ltr" lang={defaultLocale}>
			<body>
				<title>Something went wrong</title>
				<main>
					<h1>Something went wrong</h1>
					<button
						onClick={() => {
							retry();
						}}
						type="button"
					>
						Try again
					</button>
				</main>
			</body>
		</html>
	);
}
