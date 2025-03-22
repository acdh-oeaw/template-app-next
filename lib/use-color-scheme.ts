import "client-only";

import { assert } from "@acdh-oeaw/lib";
import { useLocale } from "next-intl";
import { useLayoutEffect, useSyncExternalStore } from "react";

import { dataAttribute, storageKey } from "@/lib/color-scheme-script";

type ColorScheme = "dark" | "light";

type ColorSchemeState =
	| { kind: "system"; colorScheme: ColorScheme }
	| { kind: "user"; colorScheme: ColorScheme };

declare global {
	interface Window {
		__colorScheme: {
			get: () => ColorSchemeState;
			set: (colorScheme: ColorScheme | null) => void;
			subscribe: (listener: () => void) => () => void;
			sync: () => void;
		};
	}
}

function isValidColorScheme(value: string): value is ColorScheme {
	return value === "dark" || value === "light";
}

const storage = {
	get(): string | null {
		try {
			return window.localStorage.getItem(storageKey);
		} catch {
			return null;
		}
	},
	set(value: string | null): void {
		try {
			if (value == null) {
				window.localStorage.removeItem(storageKey);
			} else {
				window.localStorage.setItem(storageKey, value);
			}
		} catch {
			/** noop */
		}
	},
};

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function setDataAttribute(colorScheme: ColorScheme): void {
	document.documentElement.dataset[dataAttribute] = colorScheme;
}

const userColorScheme = {
	get(): ColorScheme | null {
		const value = storage.get();
		if (value != null && isValidColorScheme(value)) {
			return value;
		}
		return null;
	},
	set(value: string | null): void {
		if (value != null && isValidColorScheme(value)) {
			storage.set(value);
		} else {
			storage.set(null);
		}
	},
};

const systemColorScheme = {
	get(): ColorScheme {
		return mediaQuery.matches ? "dark" : "light";
	},
};

const colorSchemeState = {
	get(): ColorSchemeState {
		const colorScheme = userColorScheme.get();
		if (colorScheme) {
			return { kind: "user", colorScheme };
		} else {
			return { kind: "system", colorScheme: systemColorScheme.get() };
		}
	},
};

function disableTransitions() {
	const element = document.createElement("style");
	element.append(
		document.createTextNode("*, *::before, *::after { transition: none !important; }"),
	);
	document.head.append(element);

	return function enableTransitions() {
		window.requestAnimationFrame(() => {
			element.remove();
		});
	};
}

let cachedColorSchemeState: ColorSchemeState;

function update(shouldDisableTransitions = true) {
	const state = colorSchemeState.get();
	cachedColorSchemeState = state;
	const enableTransitions = shouldDisableTransitions ? disableTransitions() : null;
	setDataAttribute(state.colorScheme);
	onUpdate();
	enableTransitions?.();
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

function onUpdate() {
	listeners.forEach((listener) => {
		listener();
	});
}

mediaQuery.addEventListener("change", () => {
	update();
});

window.addEventListener("storage", (event) => {
	if (event.key === storageKey && event.storageArea === window.localStorage) {
		const colorScheme = event.newValue;
		userColorScheme.set(colorScheme);
		update();
	}
});

window.__colorScheme = {
	get(): ColorSchemeState {
		return cachedColorSchemeState;
	},
	set(colorScheme: ColorScheme | null): void {
		userColorScheme.set(colorScheme);
		update();
	},
	subscribe(listener: () => void): () => void {
		return subscribe(listener);
	},
	sync(): void {
		setDataAttribute(cachedColorSchemeState.colorScheme);
	},
};

interface UseColorSchemeReturnValue {
	colorSchemeState: ColorSchemeState;
	setColorScheme: (colorScheme: ColorScheme | null) => void;
}

export function useColorScheme(): UseColorSchemeReturnValue {
	/**
	 * Throws on server and delegates to nearest suspense boundary, re-tries rendering on client.
	 * .
	 * @see https://react.dev/reference/react/Suspense#providing-a-fallback-for-server-errors-and-client-only-content
	 */
	assert(typeof document !== "undefined");

	const locale = useLocale();

	const state = useSyncExternalStore(window.__colorScheme.subscribe, window.__colorScheme.get);

	/**
	 * When the `locale` param changes, next.js will re-render the locale layout, but not
	 * re-execute the color scheme script, resulting in an `<html>` element without
	 * the `data-ui-color-scheme` attribute. So we need to programmatically re-apply it before
	 * next paint.
	 */
	useLayoutEffect(() => {
		window.__colorScheme.sync();
	}, [locale]);

	return {
		colorSchemeState: state,
		setColorScheme: window.__colorScheme.set,
	};
}
