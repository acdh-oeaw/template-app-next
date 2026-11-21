import { cookies } from "next/headers";
import { type ReactNode, Suspense } from "react";

import { ErrorBoundary } from "#/components/error/error-boundary.tsx";
import { MainContent } from "#/components/main-content.tsx";
import { assertE2eFixture } from "#/lib/e2e/fixtures.ts";

/** Throws at request time, caught by `ErrorBoundary`. */
export default function ErrorBoundaryFixturePage(): ReactNode {
	assertE2eFixture();

	return (
		<MainContent>
			<h1>Error boundary</h1>
			<ErrorBoundary>
				<Suspense fallback={<p>Loading</p>}>
					<FailingContent />
				</Suspense>
			</ErrorBoundary>
		</MainContent>
	);
}

/** Request-time content, so it does not fail the build. Tests set the cookie to recover with "Try again". */
async function FailingContent(): Promise<ReactNode> {
	const cookieStore = await cookies();

	if (cookieStore.get("e2e-error")?.value !== "off") {
		throw new Error("Error boundary fixture");
	}

	return <p>Content</p>;
}
