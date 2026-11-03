import "server-only";

import { createServerEnv } from "#/lib/env/parse.ts";

export const env = createServerEnv();
