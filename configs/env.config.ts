import { addTrailingSlash, removeTrailingSlash } from "@acdh-oeaw/lib";
import * as v from "valibot";

import { define } from "@/lib/env";

const validate = define({
	buildArgsPrefix: "NEXT_PUBLIC_",
	buildArgs: v.object({
		NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url(), v.transform(removeTrailingSlash)),
		NEXT_PUBLIC_APP_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
		NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION: v.optional(v.pipe(v.string(), v.nonEmpty())),
		NEXT_PUBLIC_APP_IMPRINT_CUSTOM_CONFIG: v.optional(v.picklist(["disabled", "enabled"]), "enabled"),
		NEXT_PUBLIC_APP_IMPRINT_SERVICE_BASE_URL: v.pipe(v.string(), v.url(), v.transform(removeTrailingSlash)),
		NEXT_PUBLIC_APP_MATOMO_BASE_URL: v.optional(v.pipe(v.string(), v.url(), v.transform(addTrailingSlash))),
		NEXT_PUBLIC_APP_MATOMO_ID: v.optional(v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1))),
		NEXT_PUBLIC_APP_SERVICE_ID: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1)),
		NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME: v.pipe(v.string(), v.nonEmpty()),
		NEXT_PUBLIC_TYPESENSE_HOST: v.pipe(v.string(), v.nonEmpty()),
		NEXT_PUBLIC_TYPESENSE_PORT: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1)),
		NEXT_PUBLIC_TYPESENSE_PROTOCOL: v.optional(v.picklist(["http", "https"]), "https"),
		/**
		 * Optional, because we need to be able to create a collection, before we create a search-only api key for that
		 * collection.
		 */
		NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY: v.optional(v.pipe(v.string(), v.nonEmpty())),
	}),
	envVars: v.object({
		BUILD_MODE: v.optional(v.picklist(["export", "standalone"])),
		CI: v.optional(v.pipe(v.unknown(), v.toBoolean())),
		EMAIL_ADDRESS: v.pipe(v.string(), v.email()),
		EMAIL_SMTP_PASSWORD: v.optional(v.pipe(v.string(), v.nonEmpty())),
		EMAIL_SMTP_PORT: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1)),
		EMAIL_SMTP_SERVER: v.pipe(v.string(), v.nonEmpty()),
		EMAIL_SMTP_USERNAME: v.optional(v.pipe(v.string(), v.nonEmpty())),
		EMAIL_SSL_CONNECTION: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
		IMGPROXY_BASE_URL: v.pipe(v.string(), v.url()),
		IMGPROXY_KEY: v.pipe(v.string(), v.nonEmpty()),
		IMGPROXY_SALT: v.pipe(v.string(), v.nonEmpty()),
		MAILPIT_API_BASE_URL: v.optional(v.pipe(v.string(), v.url())),
		NEXT_RUNTIME: v.optional(v.picklist(["edge", "nodejs"])),
		PORT: v.optional(v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1))),
		S3_ACCESS_KEY: v.pipe(v.string(), v.nonEmpty()),
		S3_BUCKET_NAME: v.pipe(v.string(), v.nonEmpty()),
		S3_HOST: v.pipe(v.string(), v.nonEmpty()),
		S3_PORT: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1)),
		S3_PROTOCOL: v.optional(v.picklist(["http", "https"]), "https"),
		S3_SECRET_KEY: v.pipe(v.string(), v.nonEmpty()),
		TYPESENSE_ADMIN_API_KEY: v.pipe(v.string(), v.nonEmpty()),
	}),
});

export const env = validate({
	environment: {
		BUILD_MODE: process.env.BUILD_MODE,
		CI: process.env.CI,
		EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
		EMAIL_SMTP_PASSWORD: process.env.EMAIL_SMTP_PASSWORD,
		EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT,
		EMAIL_SMTP_SERVER: process.env.EMAIL_SMTP_SERVER,
		EMAIL_SMTP_USERNAME: process.env.EMAIL_SMTP_USERNAME,
		EMAIL_SSL_CONNECTION: process.env.EMAIL_SSL_CONNECTION,
		IMGPROXY_BASE_URL: process.env.IMGPROXY_BASE_URL,
		IMGPROXY_KEY: process.env.IMGPROXY_KEY,
		IMGPROXY_SALT: process.env.IMGPROXY_SALT,
		MAILPIT_API_BASE_URL: process.env.MAILPIT_API_BASE_URL,
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_APP_BOTS: process.env.NEXT_PUBLIC_APP_BOTS,
		NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION,
		NEXT_PUBLIC_APP_IMPRINT_CUSTOM_CONFIG: process.env.NEXT_PUBLIC_APP_IMPRINT_CUSTOM_CONFIG,
		NEXT_PUBLIC_APP_IMPRINT_SERVICE_BASE_URL: process.env.NEXT_PUBLIC_APP_IMPRINT_SERVICE_BASE_URL,
		NEXT_PUBLIC_APP_MATOMO_BASE_URL: process.env.NEXT_PUBLIC_APP_MATOMO_BASE_URL,
		NEXT_PUBLIC_APP_MATOMO_ID: process.env.NEXT_PUBLIC_APP_MATOMO_ID,
		NEXT_PUBLIC_APP_SERVICE_ID: process.env.NEXT_PUBLIC_APP_SERVICE_ID,
		NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME: process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME,
		NEXT_PUBLIC_TYPESENSE_HOST: process.env.NEXT_PUBLIC_TYPESENSE_HOST,
		NEXT_PUBLIC_TYPESENSE_PORT: process.env.NEXT_PUBLIC_TYPESENSE_PORT,
		NEXT_PUBLIC_TYPESENSE_PROTOCOL: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
		NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY,
		NEXT_RUNTIME: process.env.NEXT_RUNTIME,
		PORT: process.env.PORT,
		S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
		S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
		S3_HOST: process.env.S3_HOST,
		S3_PORT: process.env.S3_PORT,
		S3_PROTOCOL: process.env.S3_PROTOCOL,
		S3_SECRET_KEY: process.env.S3_SECRET_KEY,
		TYPESENSE_ADMIN_API_KEY: process.env.TYPESENSE_ADMIN_API_KEY,
	},
}).unwrap();
