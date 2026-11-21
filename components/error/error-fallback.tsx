import { useExtracted as useTranslations } from "next-intl";
import type { ErrorInfo } from "next/error";
import { Fragment, type ReactNode } from "react";

interface ErrorFallbackProps extends Pick<ErrorInfo, "error" | "retry"> {
	children?: ReactNode;
}

export function ErrorFallback(props: Readonly<ErrorFallbackProps>): ReactNode {
	const { children, error, retry } = props;

	const t = useTranslations();

	const digest = getErrorDigest(error);

	return (
		<Fragment>
			{children}
			<p>{t("An unexpected error occurred.")}</p>
			{digest != null ? <p>{t("Error reference: {digest}", { digest })}</p> : null}
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

/** Errors from server components only carry a digest, which matches the error in the server logs. */
function getErrorDigest(error: unknown): string | null {
	if (Error.isError(error) && "digest" in error && typeof error.digest === "string") {
		return error.digest;
	}

	return null;
}
