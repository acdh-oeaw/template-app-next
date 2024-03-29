import type { ReactNode } from "react";

interface PageTitleProps {
	children: ReactNode;
}

export function PageTitle(props: PageTitleProps): ReactNode {
	const { children } = props;

	return (
		<h1 className="text-balance font-heading text-4xl font-semibold leading-tight tracking-tighter text-neutral-950 md:text-5xl dark:text-neutral-0">
			{children}
		</h1>
	);
}
