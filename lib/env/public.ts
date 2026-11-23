import type { PublicEnv } from "#/lib/env/schema.ts";

declare const __PUBLIC_ENV__: string;

export const env = JSON.parse(__PUBLIC_ENV__) as PublicEnv;
