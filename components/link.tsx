"use client";

import type { ComponentProps, ReactNode, Ref } from "react";
import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components/Link";

import type { AnyHref, Href } from "#/lib/navigation/href.ts";
import { Link as LocaleLink } from "#/lib/navigation/navigation.ts";

type LocaleLinkProps = ComponentProps<typeof LocaleLink>;

/** Resolves to a message for plain strings, which reads as the type error. */
type CheckedHref<THref extends string> = THref extends AnyHref
	? THref
	: "Create the href with href() or externalHref() from #/lib/navigation/href.ts";

interface LinkProps<THref extends string>
	extends Omit<AriaLinkProps, "href" | "render">, Pick<LocaleLinkProps, "prefetch" | "replace" | "scroll"> {
	href: CheckedHref<THref>;
	/** Only pages can be localized, `next-intl` keeps other hrefs as they are. Otherwise resolves to a message. */
	locale?: [THref] extends [Href]
		? LocaleLinkProps["locale"]
		: "Only hrefs of pages, created with href({ pathname }), can have a locale";
	ref?: Ref<HTMLAnchorElement>;
}

/**
 * React Aria provides interaction states (like `data-focus-visible` and `data-pressed`) and link context for compound
 * components, the `next-intl` link adds the locale prefix, and Next.js handles client navigation and prefetching.
 *
 * Without a `RouterProvider`, React Aria leaves clicks to the browser, so they reach the Next.js link.
 *
 * External urls need no special handling: `next-intl` only prefixes pathnames, and Next.js leaves clicks on
 * cross-origin urls to the browser, and does not prefetch them.
 */
export function Link<THref extends string>(props: Readonly<LinkProps<THref>>): ReactNode {
	const { href, locale: localeProp, prefetch, replace, scroll, ...rest } = props;
	/** The message type of the `locale` prop only exists for type errors. */
	const locale = localeProp as LocaleLinkProps["locale"];

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
