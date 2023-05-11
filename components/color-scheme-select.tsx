"use client";

import type { ChangeEvent, ReactNode } from "react";

import type { ColorScheme } from "@/lib/color-scheme-script";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ColorSchemeSelectProps {
	colorSchemes: Record<ColorScheme | "system", string>;
}

/** `next/dynamic`/`React.lazy` require default exports. */
// eslint-disable-next-line import/no-default-export
export default function ColorSchemeSelect(props: ColorSchemeSelectProps): ReactNode {
	const { colorSchemes } = props;

	const { colorSchemeState, setColorScheme } = useColorScheme();

	function onChange(event: ChangeEvent<HTMLSelectElement>) {
		const value = event.currentTarget.value as keyof ColorSchemeSelectProps["colorSchemes"];

		setColorScheme(value === "system" ? null : value);
	}

	return (
		<select
			onChange={onChange}
			value={colorSchemeState.kind === "system" ? "system" : colorSchemeState.colorScheme}
		>
			{Object.entries(colorSchemes).map(([id, label]) => {
				return (
					<option key={id} value={id}>
						{label}
					</option>
				);
			})}
		</select>
	);
}
