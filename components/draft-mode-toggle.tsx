import { cookies, draftMode } from "next/headers";
import type { ReactNode } from "react";

export function DraftModeToggle(): ReactNode {
	const { isEnabled } = draftMode();

	if (!isEnabled) return null;

	return (
		<div>
			Draft mode ({cookies().get("ks-branch")?.value}){" "}
			<form method="POST" action="/api/preview/end">
				<button>End preview</button>
			</form>
		</div>
	);
}
