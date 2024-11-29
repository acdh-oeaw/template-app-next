/* eslint-disable no-restricted-syntax */

import { log } from "@acdh-oeaw/lib";
import { createEnv } from "@acdh-oeaw/validate-env/next";
import * as v from "valibot";

export const env = createEnv({
	system(input) {
		const Schema = v.object({
			NODE_ENV: v.optional(v.picklist(["development", "production", "test"]), "production"),
		});

		return v.parse(Schema, input);
	},
	private(input) {
		const Schema = v.object({
			BUILD_MODE: v.optional(v.picklist(["export", "standalone"])),
			BUNDLE_ANALYZER: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			CI: v.optional(v.pipe(v.unknown(), v.transform(Boolean), v.boolean())),
			EMAIL_ADDRESS: v.pipe(v.string(), v.email()),
			EMAIL_SERVICE_API_BASE_URL: v.optional(v.pipe(v.string(), v.url())),
			EMAIL_SMTP_PORT: v.pipe(
				v.string(),
				v.transform(Number),
				v.number(),
				v.integer(),
				v.minValue(1),
			),
			EMAIL_SMTP_SERVER: v.pipe(v.string(), v.nonEmpty()),
			NEXT_RUNTIME: v.optional(v.picklist(["edge", "nodejs"])),
		});

		return v.parse(Schema, input);
	},
	public(input) {
		const Schema = v.object({
			NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
			NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: v.optional(v.pipe(v.string(), v.nonEmpty())),
			NEXT_PUBLIC_IMPRINT_SERVICE_BASE_URL: v.pipe(v.string(), v.url()),
			NEXT_PUBLIC_MATOMO_BASE_URL: v.optional(v.pipe(v.string(), v.url())),
			NEXT_PUBLIC_MATOMO_ID: v.optional(
				v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1)),
			),
			NEXT_PUBLIC_REDMINE_ID: v.pipe(
				v.string(),
				v.transform(Number),
				v.number(),
				v.integer(),
				v.minValue(1),
			),
		});

		return v.parse(Schema, input);
	},
	environment: {
		BUILD_MODE: process.env.BUILD_MODE,
		BUNDLE_ANALYZER: process.env.BUNDLE_ANALYZER,
		CI: process.env.CI,
		EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
		EMAIL_SERVICE_API_BASE_URL: process.env.EMAIL_SERVICE_API_BASE_URL,
		EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT,
		EMAIL_SMTP_SERVER: process.env.EMAIL_SMTP_SERVER,
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_BOTS: process.env.NEXT_PUBLIC_BOTS,
		NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
		NEXT_PUBLIC_IMPRINT_SERVICE_BASE_URL: process.env.NEXT_PUBLIC_IMPRINT_SERVICE_BASE_URL,
		NEXT_PUBLIC_MATOMO_BASE_URL: process.env.NEXT_PUBLIC_MATOMO_BASE_URL,
		NEXT_PUBLIC_MATOMO_ID: process.env.NEXT_PUBLIC_MATOMO_ID,
		NEXT_PUBLIC_REDMINE_ID: process.env.NEXT_PUBLIC_REDMINE_ID,
		NEXT_RUNTIME: process.env.NEXT_RUNTIME,
		NODE_ENV: process.env.NODE_ENV,
	},
	validation: v.parse(
		v.optional(v.picklist(["disabled", "enabled", "public"]), "enabled"),
		process.env.ENV_VALIDATION,
	),
	onError(error) {
		if (v.isValiError(error)) {
			const message = "Invalid environment variables";

			log.error(`${message}:`, v.flatten(error.issues).nested);

			const validationError = new Error(message);
			delete validationError.stack;

			throw validationError;
		}

		throw error;
	},
});
