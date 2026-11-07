export const colorSchemes = ["system", "light", "dark"] as const;

export type ColorScheme = (typeof colorSchemes)[number];

const defaultColorScheme: ColorScheme = "system";

const attribute = "data-color-scheme";

const storageKey = "color-scheme";

function isColorScheme(value: string | null): value is ColorScheme {
	return colorSchemes.includes(value as ColorScheme);
}

/**
 * Runs before first paint, so the page never renders with the wrong color scheme. Must match `applyStoredColorScheme`,
 * which does the same after client-side rendering, where this script does not run.
 */
export const colorSchemeScript = `try{var c=localStorage.getItem(${JSON.stringify(storageKey)});if(c!==${JSON.stringify(defaultColorScheme)}&&${JSON.stringify(colorSchemes)}.includes(c))document.documentElement.setAttribute(${JSON.stringify(attribute)},c)}catch(e){}`;

const listeners = new Set<() => void>();

export function subscribeToColorScheme(listener: () => void): () => void {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

/** The attribute on `<html>` is the single source of truth, also when `localStorage` is not available. */
export function getColorScheme(): ColorScheme {
	const value = document.documentElement.getAttribute(attribute);

	return isColorScheme(value) ? value : defaultColorScheme;
}

function applyColorScheme(colorScheme: ColorScheme): void {
	if (colorScheme === defaultColorScheme) {
		document.documentElement.removeAttribute(attribute);
	} else {
		document.documentElement.setAttribute(attribute, colorScheme);
	}

	for (const listener of listeners) {
		listener();
	}
}

export function setColorScheme(colorScheme: ColorScheme): void {
	try {
		if (colorScheme === defaultColorScheme) {
			localStorage.removeItem(storageKey);
		} else {
			localStorage.setItem(storageKey, colorScheme);
		}
	} catch {
		/** The choice still applies to the current page. */
	}

	applyColorScheme(colorScheme);
}

export function applyStoredColorScheme(): void {
	try {
		const value = localStorage.getItem(storageKey);

		applyColorScheme(isColorScheme(value) ? value : defaultColorScheme);
	} catch {
		/** Keep the current color scheme. */
	}
}

export function subscribeToStoredColorScheme(): () => void {
	function onStorage(event: StorageEvent): void {
		/** The key is `null` when the whole storage was cleared. */
		if (event.key === storageKey || event.key === null) {
			applyStoredColorScheme();
		}
	}

	window.addEventListener("storage", onStorage);

	return () => {
		window.removeEventListener("storage", onStorage);
	};
}
