import type { Options } from "@node-rs/argon2";

export const argonConfig: Options = {
	memoryCost: 19456,
	outputLen: 32,
	parallelism: 1,
	timeCost: 2,
};

export const sessionMaxDurationMs = 1000 * 60 * 60 * 24 * 30; /** 30 days. */

export const sessionRefreshIntervalMs = sessionMaxDurationMs / 2;
