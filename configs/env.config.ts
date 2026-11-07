import * as v from "valibot";

import { base64ByteLength } from "#/lib/env/actions.ts";
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
	TEST_BUILD: v.optional(
		v.pipe(
			v.picklist(["true"]),
			v.description("Includes the `*.e2e.tsx` test routes in `next build`, set by Playwright."),
		),
	),
	NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: v.optional(
		v.pipe(
			v.string(),
			v.base64(),
			base64ByteLength(16, 24, 32),
			v.description(
				"AES-GCM key to encrypt server function ids and closures, must be the same for all instances of the app. Stored in the build output by `next build`, and takes precedence over it when set at runtime.",
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
