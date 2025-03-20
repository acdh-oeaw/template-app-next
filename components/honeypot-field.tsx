import type { ReactNode } from "react";

import { fieldName } from "@/lib/server/honeypot";

export function HoneypotField(): ReactNode {
	const label = "Please do not fill out this field";

	return (
		<div aria-hidden={true} className="sr-only">
			<label>
				<span>{label}</span>
				<input autoComplete="off" defaultValue="" name={fieldName} tabIndex={-1} />
			</label>
		</div>
	);
}
