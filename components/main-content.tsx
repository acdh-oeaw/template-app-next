import { cn } from "@acdh-oeaw/style-variants";
import { Fragment, type ReactNode } from "react";

export const id = "main-content";

interface MainContentProps {
	children: ReactNode;
	className?: string;
}

export function MainContent(props: Readonly<MainContentProps>): ReactNode {
	const { children, className } = props;

	return (
		<Fragment>
			{/*
			 * Work around chrome-only bug where page is scrolled down when changing locale, and other
			 * client-side navigations. Scrolling happens when `<main>` is the first element of the page
			 * and has `tabIndex` set. Specifically, scroll is caused by
			 * [this `focus()` call](https://github.com/vercel/next.js/blob/7a124bc0dc73bc14907207bc0d04ccbbd721a334/packages/next/src/client/components/layout-router.tsx#L271).
			 * Alternative approach would be to set `scroll=false` on all navigation links.
			 *
			 * @see https://github.com/vercel/next.js/issues/49427
			 * @see https://github.com/vercel/next.js/issues/73713
			 * @see https://issues.chromium.org/issues/41349495
			 */}
			<div className="sr-only" />
			<main className={cn("outline-none", className)} id={id} tabIndex={-1}>
				{children}
			</main>
		</Fragment>
	);
}
