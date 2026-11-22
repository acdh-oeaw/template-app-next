import "server-only";

import { getExtracted } from "next-intl/server";
import { headers } from "next/headers";

import { env } from "#/lib/env/server.ts";
import { getAddressKey, getClientAddress } from "#/lib/rate-limit/client-address.ts";
import type { RateLimiter } from "#/lib/rate-limit/rate-limiter.ts";
import { ActionError } from "#/lib/server-actions/action-error.ts";
import type { ServerActionContext } from "#/lib/server-actions/create-server-action.ts";

/**
 * Throws an `ActionError` when the client exceeded the limit, so call it in `guard`. The key defaults to the address of
 * the client. Pass another key, like the id of the user after authorization, to limit each user instead.
 */
export async function rateLimit(context: ServerActionContext, limiter: RateLimiter, key?: string): Promise<void> {
	const result = await limiter.consume(key ?? (await getClientKey()));

	if (result.status === "limited") {
		const t = await getExtracted({ locale: context.locale });

		throw new ActionError(t("Too many attempts. Please try again later."));
	}
}

async function getClientKey(): Promise<string> {
	const address = getClientAddress((await headers()).get("x-forwarded-for"), env.TRUSTED_PROXY_COUNT);

	/** Next.js sets the header for every request, so a missing address is a bug, like a misconfigured proxy. */
	if (address == null) {
		throw new Error("The request has no client address.");
	}

	return getAddressKey(address);
}
