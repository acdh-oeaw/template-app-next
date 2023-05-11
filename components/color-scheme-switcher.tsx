import { MoonIcon, SunIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { type ReactNode, useMemo } from "react";

import { LoadingIndicator } from "@/components/loading-indicator";
import type { ColorScheme } from "@/lib/color-scheme-script";

const ColorSchemeSelect = dynamic(
	() => {
		return import("@/components/color-scheme-select");
	},
	{
		// @ts-expect-error `ReactNode` is a valid return type.
		loading: ColorSchemeSelectLoadingIndicator,
		ssr: false,
	},
);

export function ColorSchemeSwitcher(): ReactNode {
	const t = useTranslations("ColorSchemeSwitcher");

	const colorSchemes = useMemo(() => {
		return Object.fromEntries(
			(["system", "light", "dark"] as const).map((id) => {
				return [id, t(`color-schemes.${id}`)];
			}),
		) as Record<ColorScheme | "system", string>;
	}, [t]);

	return (
		<label>
			<span className="sr-only">{t("change-color-scheme")}</span>
			<ColorSchemeSelect colorSchemes={colorSchemes} />
		</label>
	);
}

function ColorSchemeSelectLoadingIndicator(): ReactNode {
	return <LoadingIndicator />;
}
