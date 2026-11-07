"use client";

import { type ReactNode, useState, useSyncExternalStore } from "react";

function subscribe(): () => void {
	return () => {
		/** Nothing to unsubscribe from, the value only changes when hydrating. */
	};
}

/** Throws when rendering in the browser, because throwing during prerendering would fail the build. */
export function ThrowErrorButton(): ReactNode {
	const [shouldThrow, setShouldThrow] = useState(false);

	/** Disabled until hydration, so that Playwright waits for the click handler. */
	const isHydrated = useSyncExternalStore(
		subscribe,
		() => {
			return true;
		},
		() => {
			return false;
		},
	);

	if (shouldThrow) {
		throw new Error("Test error");
	}

	return (
		<button
			disabled={!isHydrated}
			onClick={() => {
				setShouldThrow(true);
			}}
			type="button"
		>
			Throw error
		</button>
	);
}
