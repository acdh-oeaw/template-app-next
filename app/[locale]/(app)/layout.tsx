import type { ReactNode } from "react";

import { AppFooter } from "@/app/[locale]/(app)/_components/app-footer";
import { AppHeader } from "@/app/[locale]/(app)/_components/app-header";

interface AppLayoutProps {
	children: ReactNode;
}

export default function AppLayout(props: Readonly<AppLayoutProps>): ReactNode {
	const { children } = props;

	return (
		<div className="relative isolate grid min-h-full grid-rows-[auto_1fr_auto]">
			<AppHeader />
			{children}
			<AppFooter />
		</div>
	);
}
