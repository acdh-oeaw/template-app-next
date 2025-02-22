import { headers } from "next/headers";

import { RateLimitError } from "@/lib/server/errors";
import { RefillingTokenBucket } from "@/lib/server/rate-limit/rate-limiter";

export const globalBucket = new RefillingTokenBucket<string>(100, 1);

export async function globalGetRateLimit(): Promise<boolean> {
	/**
	 * Assumes `x-forwarded-for` header will always be defined.
	 *
	 * In acdh-ch infrastructure, `x-forwarded-for` actually holds the ip of the nginx ingress.
	 * Ask a sysadmin to enable "proxy-protocol" in haproxy to receive actual ip addresses.
	 */
	const clientIP = (await headers()).get("x-forwarded-for");

	if (clientIP == null) {
		return true;
	}

	return globalBucket.consume(clientIP, 1);
}

export async function globalPostRateLimit(): Promise<boolean> {
	/**
	 * Assumes `x-forwarded-for` header will always be defined.
	 *
	 * In acdh-ch infrastructure, `x-forwarded-for` actually holds the ip of the nginx ingress.
	 * Ask a sysadmin to enable "proxy-protocol" in haproxy to receive actual ip addresses.
	 */
	const clientIP = (await headers()).get("x-forwarded-for");

	if (clientIP == null) {
		return true;
	}

	return globalBucket.consume(clientIP, 3);
}

export async function assertGlobalGetRateLimit() {
	if (!(await globalGetRateLimit())) {
		throw new RateLimitError();
	}
}

export async function assertGlobalPostRateLimit() {
	if (!(await globalPostRateLimit())) {
		throw new RateLimitError();
	}
}
