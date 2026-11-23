/**
 * Features that apps created from the template can remove, with the `remove-feature` skill or by hand. Deleting `paths`
 * leaves type errors at the remaining references, so only list what `bun check` cannot find.
 */
export interface Feature {
	description: string;
	/** Files and folders that only this feature uses. */
	paths: ReadonlyArray<string>;
	/** Packages in `package.json` that only this feature uses. */
	dependencies: ReadonlyArray<string>;
	/** Services in `docker/compose.yaml` that only this feature uses. */
	composeServices: ReadonlyArray<string>;
	/** Changes that neither `bun check` nor the fields above find. */
	steps: ReadonlyArray<string>;
}

export const features = {
	contact: {
		description: "Contact form that sends mail over smtp, with Mailpit in local development.",
		paths: ["app/[locale]/contact/", "e2e/contact.test.ts", "lib/mail/", "services/contact/"],
		dependencies: ["nodemailer"],
		composeServices: ["mailpit"],
		steps: [
			"Remove the variables of the contact form and mail from the `env` of the `e2e` job in `.github/workflows/validate.yaml`.",
			"Remove the contact link from the expected links in `e2e/navigation.test.ts`.",
			"Remove the contact form section from `readme.md`.",
		],
	},
	"i18n-routing": {
		description:
			"A url per language, like `/en/about`, with a locale switcher. Remove it for an app in one language, which keeps next-intl for its messages.",
		paths: [
			"components/locale-switcher/",
			"e2e/i18n.test.ts",
			"e2e/locale-switcher.test.ts",
			"lib/i18n/routing.ts",
			"proxy.ts",
		],
		dependencies: [],
		composeServices: [],
		steps: [
			'Ask which locale to keep, then follow "One language, without i18n routing" in `readme.md`, which also moves `app/[locale]/` to `app/`, and removes the other locales.',
			'Remove the "Localized urls" section from `readme.md`, whose options no longer apply.',
		],
	},
	search: {
		description:
			"Full-text search page with Typesense, with a Typesense server in local development. A skeleton to build on.",
		paths: ["app/[locale]/search/", "lib/typesense/", "scripts/search-index.ts", "services/search/"],
		dependencies: [],
		composeServices: ["typesense"],
		steps: [
			"Remove the Typesense variables from the `env` of the `e2e` job in `.github/workflows/validate.yaml`.",
			"Remove the `search:index` script from `package.json`, and `scripts/search-index.ts` from the overrides in `configs/oxlint.config.ts`.",
			"Remove the search link from the expected links in `e2e/navigation.test.ts`, and `/en/search` from `e2e/accessibility.test.ts`.",
			"Remove the `typesense` volume from `docker/compose.yaml`.",
			"Remove the search section from `readme.md`.",
		],
	},
} satisfies Record<string, Feature>;
