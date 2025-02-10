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
			IMGPROXY_BASE_URL: v.pipe(v.string(), v.url()),
			IMGPROXY_KEY: v.pipe(v.string(), v.nonEmpty()),
			IMGPROXY_SALT: v.pipe(v.string(), v.nonEmpty()),
			S3_ACCESS_KEY: v.pipe(v.string(), v.nonEmpty()),
			S3_BUCKET: v.pipe(v.string(), v.nonEmpty()),
			S3_HOST: v.pipe(v.string(), v.nonEmpty()),
			S3_PORT: v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1)),
			S3_PROTOCOL: v.optional(v.picklist(["http", "https"]), "https"),
			S3_SECRET_KEY: v.pipe(v.string(), v.nonEmpty()),
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
		BUILD_MODE: process.env.BUILD_MODE,
		BUNDLE_ANALYZER: process.env.BUNDLE_ANALYZER,
		CI: process.env.CI,
		IMGPROXY_BASE_URL: process.env.IMGPROXY_BASE_URL,
		IMGPROXY_KEY: process.env.IMGPROXY_KEY,
		IMGPROXY_SALT: process.env.IMGPROXY_SALT,
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_BOTS: process.env.NEXT_PUBLIC_BOTS,
		NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
		NEXT_PUBLIC_MATOMO_BASE_URL: process.env.NEXT_PUBLIC_MATOMO_BASE_URL,
		NEXT_PUBLIC_MATOMO_ID: process.env.NEXT_PUBLIC_MATOMO_ID,
		NEXT_PUBLIC_REDMINE_ID: process.env.NEXT_PUBLIC_REDMINE_ID,
		NODE_ENV: process.env.NODE_ENV,
		S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
		S3_BUCKET: process.env.S3_BUCKET,
		S3_HOST: process.env.S3_HOST,
		S3_PORT: process.env.S3_PORT,
		S3_PROTOCOL: process.env.S3_PROTOCOL,
		S3_SECRET_KEY: process.env.S3_SECRET_KEY,
	},
	validation: v.parse(
		v.optional(v.picklist(["disabled", "enabled", "public"]), "enabled"),
		process.env.ENV_VALIDATION,
	),
	onError(error) {
		if (error instanceof v.ValiError) {
			const message = "Invalid environment variables";

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			log.error(`${message}:`, v.flatten(error.issues).nested);

			const validationError = new Error(message);
			delete validationError.stack;

			throw validationError;
		}

		throw error;
	},
});
