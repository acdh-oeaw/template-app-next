import type { Options } from "@node-rs/argon2";

export const argonConfig: Options = {
	memoryCost: 19456,
	outputLen: 32,
	parallelism: 1,
	timeCost: 2,
};
