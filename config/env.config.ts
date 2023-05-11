import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOTS?: string | undefined;
			BUNDLE_ANALYZER?: string | undefined;
			ENV_VALIDATION?: string | undefined;
			NEXT_PUBLIC_APP_BASE_URL?: string | undefined;
			NEXT_PUBLIC_MATOMO_BASE_URL?: string | undefined;
			NEXT_PUBLIC_MATOMO_ID?: string | undefined;
			NEXT_PUBLIC_REDMINE_ID?: string | undefined;
		}
	}
}

export const env = createEnv({
	shared: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
	},
	server: {
		BOTS: z.enum(["disabled", "enabled"]).optional(),
		BUNDLE_ANALYZER: z.enum(["disabled", "enabled"]).optional(),
		ENV_VALIDATION: z.enum(["disabled", "enabled"]).optional(),
	},
	client: {
		NEXT_PUBLIC_APP_BASE_URL: z.string().url(),
		NEXT_PUBLIC_MATOMO_BASE_URL: z.string().url().optional(),
		NEXT_PUBLIC_MATOMO_ID: z.string().min(1).optional(),
		NEXT_PUBLIC_REDMINE_ID: z.coerce.number().min(1),
	},
	runtimeEnv: {
		BOTS: process.env.BOTS,
		BUNDLE_ANALYZER: process.env.BUNDLE_ANALYZER,
		ENV_VALIDATION: process.env.ENV_VALIDATION,
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_MATOMO_BASE_URL: process.env.NEXT_PUBLIC_MATOMO_BASE_URL,
		NEXT_PUBLIC_MATOMO_ID: process.env.NEXT_PUBLIC_MATOMO_ID,
		NEXT_PUBLIC_REDMINE_ID: process.env.NEXT_PUBLIC_REDMINE_ID,
	},
	skipValidation: process.env.ENV_VALIDATION === "disabled",
});
