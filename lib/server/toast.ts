import { cookies } from "next/headers";
import type { ToastOptions } from "react-aria-components";
import * as v from "valibot";

import type { ToastContent } from "@/components/ui/toast";

const toastCookieName = "toast";

export async function setToastCookie(
	content: ToastContent,
	options?: Pick<ToastOptions, "timeout">,
): Promise<void> {
	const value = JSON.stringify({ content, options });

	(await cookies()).set(toastCookieName, value, { maxAge: 0 });
}

const ToastContentSchema = v.object({
	content: v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		description: v.optional(v.pipe(v.string(), v.nonEmpty())),
		status: v.picklist(["success", "error"]),
	}),
	options: v.optional(
		v.object({
			timeout: v.optional(v.pipe(v.number(), v.minValue(0))),
		}),
	),
});

export async function getToastCookie(): Promise<{
	content: ToastContent;
	options?: { timeout?: number };
} | null> {
	const toast = (await cookies()).get(toastCookieName)?.value;

	if (toast == null) {
		return null;
	}

	try {
		const value = JSON.parse(toast) as unknown;

		return v.parse(ToastContentSchema, value);
	} catch {
		return null;
	}
}
