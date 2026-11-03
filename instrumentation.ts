import { assertServerEnv } from "#/lib/env/parse.ts";

export function register(): void {
	assertServerEnv();
}
