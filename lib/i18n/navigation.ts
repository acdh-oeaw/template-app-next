import type { Route } from "next";
import { createNavigation } from "next-intl/navigation";
import type { ComponentProps, ReactNode } from "react";

import { routing } from "@/lib/i18n/routing";

const { Link, getPathname, redirect: _redirect, usePathname, useRouter } = createNavigation(routing);

/** @see {@link https://github.com/amannn/next-intl/issues/823} */
const redirect: typeof _redirect = _redirect;

export { getPathname, Link, redirect, usePathname, useRouter };

export { useSearchParams } from "next/navigation";

type LinkProps = ComponentProps<typeof Link>;

export interface LocaleLinkProps<TRoute extends string> extends Omit<LinkProps, "href"> {
	href?: Route<TRoute>;
}

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
export const LocaleLink = Link as <TRoute extends string>(props: LocaleLinkProps<TRoute>) => ReactNode;
