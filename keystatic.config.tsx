import { withI18nPrefix } from "@acdh-oeaw/keystatic-lib";
import { config } from "@keystatic/core";

import { Logo } from "@/components/logo";
import { env } from "@/config/env.config";
import { locales } from "@/config/i18n.config";
import { createDocumentation, createPeople } from "@/lib/keystatic/collections";
import { createMetadata, createNavigation } from "@/lib/keystatic/singletons";

export default config({
	collections: {
		[withI18nPrefix("documentation", "de")]: createDocumentation("de"),
		[withI18nPrefix("documentation", "en")]: createDocumentation("en"),

		[withI18nPrefix("people", "de")]: createPeople("de"),
		[withI18nPrefix("people", "en")]: createPeople("en"),
	},
	singletons: {
		[withI18nPrefix("metadata", "de")]: createMetadata("de"),
		[withI18nPrefix("metadata", "en")]: createMetadata("en"),

		[withI18nPrefix("navigation", "de")]: createNavigation("de"),
		[withI18nPrefix("navigation", "en")]: createNavigation("en"),
	},
	storage:
		env.NEXT_PUBLIC_KEYSTATIC_MODE === "github" &&
		env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER &&
		env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME
			? {
					kind: "github",
					repo: {
						owner: env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER,
						name: env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME,
					},
					branchPrefix: "content/",
				}
			: {
					kind: "local",
				},
	ui: {
		brand: {
			mark() {
				return <Logo />;
			},
			name: "ACDH-CH",
		},
		navigation: {
			Content: [
				...locales.map((locale) => {
					return withI18nPrefix("documentation", locale);
				}),
			],
			Data: [
				...locales.map((locale) => {
					return withI18nPrefix("people", locale);
				}),
			],
			Settings: [
				...locales.map((locale) => {
					return withI18nPrefix("navigation", locale);
				}),
				"---",
				...locales.map((locale) => {
					return withI18nPrefix("metadata", locale);
				}),
			],
		},
	},
});
