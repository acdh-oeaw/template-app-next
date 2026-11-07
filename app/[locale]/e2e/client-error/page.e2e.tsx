import type { ReactNode } from "react";

import { ThrowErrorButton } from "#/components/e2e/throw-error-button.tsx";

export default function ClientErrorPage(): ReactNode {
	return (
		<main>
			<h1>Client error</h1>
			<ThrowErrorButton />
		</main>
	);
}
