import { createNavigation } from "next-intl/navigation";
import type { ComponentPropsWithRef, FC } from "react";

import { routing } from "@/lib/i18n/routing";

const {
	Link,
	getPathname,
	redirect: _redirect,
	usePathname,
	useRouter,
} = createNavigation(routing);

/** FIXME: @see https://github.com/amannn/next-intl/issues/823 */
const redirect: typeof _redirect = _redirect;

export { getPathname, redirect, usePathname, useRouter };

// eslint-disable-next-line no-restricted-imports
export { useSearchParams } from "next/navigation";

export type LocaleLinkProps = Omit<ComponentPropsWithRef<typeof Link>, "href"> & {
	href?: string | undefined;
};

export const LocaleLink = Link as FC<LocaleLinkProps>;
