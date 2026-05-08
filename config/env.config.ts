import { addTrailingSlash, removeTrailingSlash } from "@acdh-oeaw/lib";
import * as v from "valibot";

import { define } from "#/lib/env";

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
	}),
	envVars: v.object({
		BUILD_MODE: v.optional(v.picklist(["export", "standalone"])),
		CI: v.optional(v.pipe(v.unknown(), v.toBoolean())),
		NEXT_RUNTIME: v.optional(v.picklist(["edge", "nodejs"])),
		PORT: v.optional(v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1))),
	}),
});

export const env = validate({
	environment: {
		BUILD_MODE: process.env.BUILD_MODE,
		CI: process.env.CI,
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_APP_BOTS: process.env.NEXT_PUBLIC_APP_BOTS,
		NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION,
		NEXT_PUBLIC_APP_IMPRINT_CUSTOM_CONFIG: process.env.NEXT_PUBLIC_APP_IMPRINT_CUSTOM_CONFIG,
		NEXT_PUBLIC_APP_IMPRINT_SERVICE_BASE_URL: process.env.NEXT_PUBLIC_APP_IMPRINT_SERVICE_BASE_URL,
		NEXT_PUBLIC_APP_MATOMO_BASE_URL: process.env.NEXT_PUBLIC_APP_MATOMO_BASE_URL,
		NEXT_PUBLIC_APP_MATOMO_ID: process.env.NEXT_PUBLIC_APP_MATOMO_ID,
		NEXT_RUNTIME: process.env.NEXT_RUNTIME,
		PORT: process.env.PORT,
	},
}).unwrap();
