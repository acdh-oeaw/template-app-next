"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

export const ColorSchemeSelect = dynamic(
	() => {
		return import("@/app/[locale]/_components/color-scheme-select.client").then((module) => {
			return { default: module.ColorSchemeSelect };
		});
	},
	{
		// @ts-expect-error `ReactNode` is a valid return type.
		loading: ColorSchemeSelectLoadingIndicator,
		ssr: false,
	},
);

function ColorSchemeSelectLoadingIndicator(): ReactNode {
	return <div className="size-10" />;
}
