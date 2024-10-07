import type { ReactNode } from "react";

import { env } from "@/config/env.config";

export function TailwindIndicator(): ReactNode {
	if (env.NODE_ENV !== "development") return null;

	return (
		<div className="bg-on-background text-xs font-medium text-background fixed bottom-1 left-1 z-10 grid size-8 cursor-default select-none place-content-center rounded-full p-2 font-mono">
			<span className="xs:hidden">2xs</span>
			<span className="max-xs:hidden sm:hidden">xs</span>
			<span className="max-sm:hidden md:hidden">sm</span>
			<span className="max-md:hidden lg:hidden">md</span>
			<span className="max-lg:hidden xl:hidden">lg</span>
			<span className="max-xl:hidden 2xl:hidden">xl</span>
			<span className="max-2xl:hidden 3xl:hidden">2xl</span>
			<span className="max-3xl:hidden">3xl</span>
		</div>
	);
}
