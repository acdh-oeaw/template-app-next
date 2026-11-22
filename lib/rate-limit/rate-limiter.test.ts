import { afterEach, describe, expect, setSystemTime, test } from "bun:test";

import { createMemoryRateLimitStore, createRateLimiter, type RateLimiter } from "#/lib/rate-limit/rate-limiter.ts";

afterEach(() => {
	setSystemTime();
});

async function consumeAll(limiter: RateLimiter, keys: Array<string>) {
	const results = [];

	for (const key of keys) {
		// oxlint-disable-next-line no-await-in-loop -- requests count in order
		results.push(await limiter.consume(key));
	}

	return results;
}

describe("createRateLimiter", () => {
	test("allows `limit` requests per key and window", async () => {
		setSystemTime(new Date("2026-01-01T00:00:00Z"));
		const limiter = createRateLimiter({ name: "test", limit: 2, windowMs: 60_000 });

		const results = await consumeAll(limiter, ["a", "a", "b"]);
		expect(results).toStrictEqual([{ status: "allowed" }, { status: "allowed" }, { status: "allowed" }]);

		setSystemTime(new Date("2026-01-01T00:00:15Z"));
		const result = await limiter.consume("a");
		expect(result).toStrictEqual({ status: "limited", retryAfterMs: 45_000 });
	});

	test("allows requests again in the next window", async () => {
		setSystemTime(new Date("2026-01-01T00:00:00Z"));
		const limiter = createRateLimiter({ name: "test", limit: 1, windowMs: 60_000 });

		const results = await consumeAll(limiter, ["a", "a"]);
		expect(results[1]).toHaveProperty("status", "limited");

		setSystemTime(new Date("2026-01-01T00:01:00Z"));
		const result = await limiter.consume("a");
		expect(result).toStrictEqual({ status: "allowed" });
	});

	test("keeps the keys of rate limiters that share a store apart", async () => {
		const store = createMemoryRateLimitStore();
		const signIn = createRateLimiter({ name: "sign-in", limit: 1, windowMs: 60_000, store });
		const contact = createRateLimiter({ name: "contact", limit: 1, windowMs: 60_000, store });

		await signIn.consume("a");
		const contactResult = await contact.consume("a");
		const signInResult = await signIn.consume("a");

		expect(contactResult).toStrictEqual({ status: "allowed" });
		expect(signInResult).toHaveProperty("status", "limited");
	});
});

describe("createMemoryRateLimitStore", () => {
	test("starts a new window for keys whose window expired", async () => {
		setSystemTime(new Date("2026-01-01T00:00:00Z"));
		const store = createMemoryRateLimitStore();

		await store.increment("a", 1000);
		await store.increment("a", 1000);

		setSystemTime(new Date("2026-01-01T00:00:01Z"));
		const window = await store.increment("a", 1000);

		expect(window).toStrictEqual({ count: 1, resetAt: new Date("2026-01-01T00:00:02Z").getTime() });
	});
});
