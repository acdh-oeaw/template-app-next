import type { ReactNode } from "react";

import { ServerToast as ServerToastClient } from "@/components/server-toast.client";
import { getToastCookie } from "@/lib/server/toast";

export async function ServerToast(): Promise<ReactNode> {
	const toast = await getToastCookie();

	if (toast == null) {
		return null;
	}

	return <ServerToastClient toast={toast} />;
}
