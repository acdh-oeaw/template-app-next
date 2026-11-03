import type { PublicEnv } from "#/configs/env.config.ts";

declare const __PUBLIC_ENV__: string;

const publicEnv = JSON.parse(__PUBLIC_ENV__) as PublicEnv | null;

if (publicEnv == null) {
	throw new Error(
		"Public environment variables were not inlined, because the app was built with `ENV_VALIDATION=disabled`.",
	);
}

export const env: PublicEnv = publicEnv;
