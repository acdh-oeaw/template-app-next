import { AsteriskIcon } from "lucide-react";
import type { ReactNode } from "react";

export function RequiredIndicator(): ReactNode {
	return (
		<AsteriskIcon
			aria-hidden={true}
			className="size-3.5 shrink-0 self-start text-text-weak group-disabled:text-text-disabled"
			data-slot="icon"
		/>
	);
}
