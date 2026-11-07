"use client";

import { type ReactNode, useState } from "react";

/** Throws when rendering in the browser, because throwing during prerendering would fail the build. */
export function ThrowErrorButton(): ReactNode {
	const [shouldThrow, setShouldThrow] = useState(false);

	if (shouldThrow) {
		throw new Error("Test error");
	}

	return (
		<button
			onClick={() => {
				setShouldThrow(true);
			}}
			type="button"
		>
			Throw error
		</button>
	);
}
