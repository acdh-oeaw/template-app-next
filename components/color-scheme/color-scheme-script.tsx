"use client";

import { type ReactNode, useLayoutEffect } from "react";

import {
	applyStoredColorScheme,
	colorSchemeScript,
	subscribeToStoredColorScheme,
} from "#/components/color-scheme/color-scheme.ts";

/**
 * The inline script handles server-rendered documents. Scripts created by React on the client do not run, so the effect
 * covers everything else, e.g. when `<html>` is rendered on the client.
 *
 * @see {@link https://nextjs.org/docs/app/guides/preventing-flash-before-hydration}
 */
export function ColorSchemeScript(): ReactNode {
	useLayoutEffect(() => {
		applyStoredColorScheme();

		return subscribeToStoredColorScheme();
	}, []);

	return (
		<script
			dangerouslySetInnerHTML={{ __html: colorSchemeScript }}
			suppressHydrationWarning={true}
			type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
		/>
	);
}
