import type { ReactNode } from "react";

import { ThrowErrorButton } from "#/components/e2e/throw-error-button.tsx";

interface GlobalErrorLayoutProps {
	children: ReactNode;
}

/**
 * A separate root layout, because only errors in root layouts reach `global-error.tsx`. Below `/api`, to skip the
 * proxy.
 */
export default function GlobalErrorLayout(props: Readonly<GlobalErrorLayoutProps>): ReactNode {
	const { children } = props;

	return (
		<html lang="en-GB">
			<body>
				<ThrowErrorButton />
				{children}
			</body>
		</html>
	);
}
