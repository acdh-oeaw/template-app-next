"use client";

import { useExtracted as useTranslations } from "next-intl";
import { type ReactNode, Suspense, use, useSyncExternalStore } from "react";
import { Label } from "react-aria-components/Label";
import { Radio, RadioGroup } from "react-aria-components/RadioGroup";
import { browser } from "react-dom";

import {
	type ColorScheme,
	colorSchemes,
	getColorScheme,
	setColorScheme,
	subscribeToColorScheme,
} from "#/components/color-scheme/color-scheme.ts";

interface ColorSchemeRadioGroupProps {
	isDisabled?: boolean;
	onChange?: (colorScheme: ColorScheme) => void;
	value?: ColorScheme;
}

function ColorSchemeRadioGroup(props: Readonly<ColorSchemeRadioGroupProps>): ReactNode {
	const { isDisabled, onChange, value } = props;

	const t = useTranslations();

	const labels: Record<ColorScheme, string> = {
		system: t("System"),
		light: t("Light"),
		dark: t("Dark"),
	};

	return (
		<RadioGroup
			className="flex gap-2"
			isDisabled={isDisabled}
			onChange={(value) => {
				onChange?.(value as ColorScheme);
			}}
			orientation="horizontal"
			value={value ?? null}
		>
			<Label>{t("Color scheme")}</Label>
			{colorSchemes.map((colorScheme) => {
				return (
					<Radio key={colorScheme} className="inline-flex selected:underline" value={colorScheme}>
						{labels[colorScheme]}
					</Radio>
				);
			})}
		</RadioGroup>
	);
}

function ColorSchemeSwitcherContent(): ReactNode {
	use(browser("The color scheme is stored in localStorage."));

	const colorScheme = useSyncExternalStore(subscribeToColorScheme, getColorScheme);

	return <ColorSchemeRadioGroup onChange={setColorScheme} value={colorScheme} />;
}

/** The fallback is in the prerendered html, and has the same size as the switcher, so there is no layout shift. */
export function ColorSchemeSwitcher(): ReactNode {
	return (
		<Suspense fallback={<ColorSchemeRadioGroup isDisabled={true} />}>
			<ColorSchemeSwitcherContent />
		</Suspense>
	);
}
