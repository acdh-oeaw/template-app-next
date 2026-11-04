import * as v from "valibot";

import { generate } from "#/lib/env/generate.ts";

/** Available in client and server code, inlined at build time. */
export const publicEnvSchema = v.object({
	NEXT_PUBLIC_APP_BASE_URL: v.pipe(
		v.string(),
		v.url(),
		v.description("Public base url of the app, used for canonical urls and metadata."),
		v.metadata({ dev: "http://localhost:3000" }),
	),
});

/** Available in server code only, validated on first read. */
export const serverEnvSchema = v.object({
	BUILD_MODE: v.optional(
		v.pipe(v.picklist(["standalone"]), v.description("Output mode of `next build`, set in the `Dockerfile`.")),
	),
	NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: v.optional(
		v.pipe(
			v.string(),
			v.base64(),
			v.description(
				"Key to encrypt server function ids, must be the same for all instances of the app. Only read by `next build`.",
			),
			v.metadata({ dev: generate.base64(32) }),
		),
	),
});

export type PublicEnv = v.InferOutput<typeof publicEnvSchema>;

export type ServerEnv = v.InferOutput<typeof serverEnvSchema>;

type NoKeys<T extends never> = T;

type Json = string | number | boolean | null | Array<Json> | { [key: string]: Json };

/** Only public keys start with `NEXT_PUBLIC_`, and public values are json. */
export type EnvKeyChecks = [
	NoKeys<Exclude<keyof PublicEnv, `NEXT_PUBLIC_${string}`>>,
	NoKeys<Extract<keyof ServerEnv, `NEXT_PUBLIC_${string}`>>,
	NoKeys<{ [K in keyof PublicEnv]-?: PublicEnv[K] extends Json | undefined ? never : K }[keyof PublicEnv]>,
];
