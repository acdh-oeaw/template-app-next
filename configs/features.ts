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
} satisfies Record<string, Feature>;
