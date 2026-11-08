"use client";

import type { ComponentProps, ReactNode, Ref } from "react";
import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components/Link";

import { Link as LocaleLink } from "#/lib/i18n/navigation.ts";

type LocaleLinkProps = ComponentProps<typeof LocaleLink>;

interface LinkProps
	extends Omit<AriaLinkProps, "href" | "render">, Pick<LocaleLinkProps, "locale" | "prefetch" | "replace" | "scroll"> {
	href: string;
	ref?: Ref<HTMLAnchorElement>;
}

/**
 * React Aria provides interaction states (like `data-focus-visible` and `data-pressed`) and link context for compound
 * components, the `next-intl` link adds the locale prefix, and Next.js handles client navigation and prefetching.
 *
 * Without a `RouterProvider`, React Aria leaves clicks to the browser, so they reach the Next.js link.
 */
export function Link(props: Readonly<LinkProps>): ReactNode {
	const { href, locale, prefetch, replace, scroll, ...rest } = props;

	return (
		<AriaLink
			{...rest}
			href={href}
			render={(domProps) => {
				if (!("href" in domProps)) {
					return <span {...domProps} />;
				}

				return (
					<LocaleLink {...domProps} href={href} locale={locale} prefetch={prefetch} replace={replace} scroll={scroll} />
				);
			}}
		/>
	);
}
