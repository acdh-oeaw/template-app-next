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
			AUTH_SIGN_UP: v.optional(v.picklist(["disabled", "enabled"]), "enabled"),
			BUILD_MODE: v.optional(v.picklist(["export", "standalone"])),
			BUNDLE_ANALYZER: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			CI: v.optional(v.pipe(v.unknown(), v.transform(Boolean), v.boolean())),
			DB_HOST: v.pipe(v.string(), v.nonEmpty()),
			DB_MIGRATIONS: v.optional(v.picklist(["disabled", "enabled"]), "enabled"),
			DB_NAME: v.pipe(v.string(), v.nonEmpty()),
			DB_PASSWORD: v.pipe(v.string(), v.minLength(8)),
			DB_PORT: v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1000)),
			DB_USER: v.pipe(v.string(), v.nonEmpty()),
			EMAIL_ADDRESS: v.pipe(v.string(), v.email()),
			EMAIL_SMTP_PASSWORD: v.optional(v.pipe(v.string(), v.minLength(8))),
			EMAIL_SMTP_PORT: v.pipe(
				v.string(),
				v.transform(Number),
				v.number(),
				v.integer(),
				v.minValue(1),
			),
			EMAIL_SMTP_SERVER: v.pipe(v.string(), v.nonEmpty()),
			EMAIL_SMTP_USERNAME: v.optional(v.pipe(v.string(), v.nonEmpty())),
			ENCRYPTION_KEY: v.pipe(v.string(), v.minLength(24)),
		});

		return v.parse(Schema, input);
	},
	public(input) {
		const Schema = v.object({
			NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
			NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: v.optional(v.string()),
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
		AUTH_SIGN_UP: process.env.AUTH_SIGN_UP,
		BUILD_MODE: process.env.BUILD_MODE,
		BUNDLE_ANALYZER: process.env.BUNDLE_ANALYZER,
		CI: process.env.CI,
		DB_HOST: process.env.DB_HOST,
		DB_MIGRATIONS: process.env.DB_MIGRATIONS,
		DB_NAME: process.env.DB_NAME,
		DB_PASSWORD: process.env.DB_PASSWORD,
		DB_PORT: process.env.DB_PORT,
		DB_USER: process.env.DB_USER,
		EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
		EMAIL_SMTP_PASSWORD: process.env.EMAIL_SMTP_PASSWORD,
		EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT,
		EMAIL_SMTP_SERVER: process.env.EMAIL_SMTP_SERVER,
		EMAIL_SMTP_USERNAME: process.env.EMAIL_SMTP_USERNAME,
		ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_BOTS: process.env.NEXT_PUBLIC_BOTS,
		NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
		NEXT_PUBLIC_MATOMO_BASE_URL: process.env.NEXT_PUBLIC_MATOMO_BASE_URL,
		NEXT_PUBLIC_MATOMO_ID: process.env.NEXT_PUBLIC_MATOMO_ID,
		NEXT_PUBLIC_REDMINE_ID: process.env.NEXT_PUBLIC_REDMINE_ID,
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
