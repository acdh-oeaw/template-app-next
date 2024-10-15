import { headers } from "next/headers";

import { RefillingTokenBucket } from "@/lib/rate-limit/bucket";

const globalBucket = new RefillingTokenBucket<string>(100, 1);

export function globalGETRateLimit(): boolean {
	// NOTE: Assumes X-Forwarded-For will always be defined.
	const clientIP = headers().get("X-Forwarded-For");

	if (clientIP == null) return true;

	return globalBucket.consume(clientIP, 1);
}

export function globalPOSTRateLimit(): boolean {
	// NOTE: Assumes X-Forwarded-For will always be defined.
	const clientIP = headers().get("X-Forwarded-For");

	if (clientIP == null) return true;

	return globalBucket.consume(clientIP, 3);
}
