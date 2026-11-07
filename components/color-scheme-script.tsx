import type { ReactNode } from "react";

/** Keep in sync with `colorSchemeStorageKey` in `color-scheme-switcher.tsx`. */
const script = `try {
	const colorScheme = localStorage.getItem("color-scheme");
	if (colorScheme === "light" || colorScheme === "dark") document.documentElement.dataset.colorScheme = colorScheme;
} catch {}`;

/** Pages are prerendered, so the color scheme has to be applied before the first paint, in the browser. */
export function ColorSchemeScript(): ReactNode {
	return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
