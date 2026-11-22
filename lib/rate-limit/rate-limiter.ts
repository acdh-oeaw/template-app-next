export interface RateLimitWindow {
	count: number;
	/** Milliseconds since the epoch. */
	resetAt: number;
}

/**
 * Counts requests per key in fixed windows. Use a shared store, like Redis or Valkey, when the app runs on several
 * instances, because each instance has its own memory.
 */
export interface RateLimitStore {
	increment: (key: string, windowMs: number) => Promise<RateLimitWindow> | RateLimitWindow;
}

export function createMemoryRateLimitStore(): RateLimitStore {
	const windows = new Map<string, RateLimitWindow>();
	let sweepAt = 0;

	return {
		increment(key, windowMs) {
			const now = Date.now();

			/** Removes expired windows, so that keys of past clients don't accumulate. */
			if (now >= sweepAt) {
				for (const [windowKey, window] of windows) {
					if (window.resetAt <= now) {
						windows.delete(windowKey);
					}
				}

				sweepAt = now + windowMs;
			}

			let window = windows.get(key);

			if (window == null || window.resetAt <= now) {
				window = { count: 0, resetAt: now + windowMs };
				windows.set(key, window);
			}

			window.count += 1;

			return { ...window };
		},
	};
}

export type RateLimitResult = { status: "allowed" } | { status: "limited"; retryAfterMs: number };

export interface RateLimiter {
	consume: (key: string) => Promise<RateLimitResult>;
}

interface CreateRateLimiterOptions {
	/** Prefixes the keys, so that rate limiters can share a store. */
	name: string;
	/** Requests per key and window. */
	limit: number;
	windowMs: number;
	store?: RateLimitStore;
}

/** Allows `limit` requests per key in each window of `windowMs`. Create it once, at module level. */
export function createRateLimiter(options: CreateRateLimiterOptions): RateLimiter {
	const { limit, name, store = createMemoryRateLimitStore(), windowMs } = options;

	return {
		async consume(key) {
			const window = await store.increment(`${name}:${key}`, windowMs);

			if (window.count <= limit) {
				return { status: "allowed" };
			}

			return { status: "limited", retryAfterMs: Math.max(window.resetAt - Date.now(), 0) };
		},
	};
}
