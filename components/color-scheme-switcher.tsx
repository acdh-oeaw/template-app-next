"use client";

import { useExtracted as useTranslations } from "next-intl";
import { type ReactNode, useSyncExternalStore } from "react";
import { Label } from "react-aria-components/Label";
import { Radio, RadioGroup } from "react-aria-components/RadioGroup";

const colorSchemeStorageKey = "color-scheme";

type ColorScheme = "dark" | "light" | "system";

function isColorScheme(value: string): value is ColorScheme {
	return value === "dark" || value === "light" || value === "system";
}

function getColorScheme(): ColorScheme {
	const value = document.documentElement.dataset.colorScheme;

	return value != null && isColorScheme(value) ? value : "system";
}

/** The switcher is disabled until hydration, because native radio inputs would change without updating the page. */
function getServerColorScheme(): null {
	return null;
}

function applyColorScheme(colorScheme: ColorScheme): void {
	if (colorScheme === "system") {
		delete document.documentElement.dataset.colorScheme;
	} else {
		document.documentElement.dataset.colorScheme = colorScheme;
	}
}

function setColorScheme(colorScheme: ColorScheme): void {
	try {
		if (colorScheme === "system") {
			localStorage.removeItem(colorSchemeStorageKey);
		} else {
			localStorage.setItem(colorSchemeStorageKey, colorScheme);
		}
	} catch {
		/** Storage can be unavailable, the color scheme then only applies to the current page. */
	}

	applyColorScheme(colorScheme);
}

function subscribe(onChange: () => void): () => void {
	const observer = new MutationObserver(onChange);

	observer.observe(document.documentElement, { attributeFilter: ["data-color-scheme"] });

	return () => {
		observer.disconnect();
	};
}

export function ColorSchemeSwitcher(): ReactNode {
	const t = useTranslations();

	const colorScheme = useSyncExternalStore(subscribe, getColorScheme, getServerColorScheme);

	const options: Array<{ id: ColorScheme; label: string }> = [
		{ id: "system", label: t("System") },
		{ id: "light", label: t("Light") },
		{ id: "dark", label: t("Dark") },
	];

	return (
		<RadioGroup
			className="flex gap-2"
			isDisabled={colorScheme == null}
			onChange={(value) => {
				if (isColorScheme(value)) {
					setColorScheme(value);
				}
			}}
			orientation="horizontal"
			value={colorScheme ?? "system"}
		>
			<Label>{t("Color scheme")}</Label>
			{options.map((option) => {
				return (
					<Radio
						key={option.id}
						className="cursor-pointer focus-visible:outline-2 selected:font-bold"
						value={option.id}
					>
						{option.label}
					</Radio>
				);
			})}
		</RadioGroup>
	);
}
