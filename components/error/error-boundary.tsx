"use client";

import { catchError, type ErrorInfo } from "next/error";
import type { ReactNode } from "react";

import { ErrorFallback } from "#/components/error/error-fallback.tsx";

function ErrorBoundaryFallback(_props: object, info: ErrorInfo): ReactNode {
	const { error, retry } = info;

	return (
		<div role="alert">
			<ErrorFallback error={error} retry={retry} />
		</div>
	);
}

/**
 * Contains errors in a part of a page, like request-time content inside `<Suspense>`, so the rest of the page stays
 * usable. Errors thrown during server rendering only show the fallback after hydration.
 */
export const ErrorBoundary = catchError(ErrorBoundaryFallback);
