import type { ReactNode } from "react";

interface PageTitleProps {
	children: ReactNode;
}

export function PageTitle(props: PageTitleProps): ReactNode {
	const { children } = props;

	return (
		<h1 className="text-4xl font-semibold text-neutral-950 md:text-5xl dark:text-neutral-0 text-balance font-heading leading-tight tracking-tighter">
			{children}
		</h1>
	);
}
