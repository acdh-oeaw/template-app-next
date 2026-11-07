import { clsx } from "clsx/lite";
import type { ComponentProps, ReactNode } from "react";

export const mainContentId = "main-content";

interface MainContentProps extends ComponentProps<"main"> {}

/**
 * Focus target for `SkipLink`, which is why it needs an `id` and `tabIndex`.
 *
 * With `cacheComponents`, previous pages stay in the DOM with `display: none`, so the `id` is not unique after client
 * navigations. This works because the visible page comes first in the DOM, which `e2e/skip-link.test.ts` checks.
 */
export function MainContent(props: Readonly<MainContentProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<main {...rest} className={clsx("outline-none", className)} id={mainContentId} tabIndex={-1}>
			{children}
		</main>
	);
}
