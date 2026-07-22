import { keyBy } from "@acdh-oeaw/lib";

import { type IntlLocale, getIntlLanguage } from "@/lib/i18n/locales";
import type metadataMessages from "@/messages/metadata/en/index.json";

type Metadata = typeof metadataMessages;
type SocialMedia = Metadata["social"];
type SocialMediaMetadata = {
	[Kind in SocialMedia[number]["kind"]]: Extract<SocialMedia[number], { kind: Kind }>;
};

export interface IntlMessages {
	metadata: Omit<Metadata, "social"> & { social: SocialMediaMetadata };
}

export async function getIntlMessages(locale: IntlLocale): Promise<IntlMessages> {
	const language = getIntlLanguage(locale);

	// oxlint-disable-next-line typescript/no-unsafe-assignment
	const [{ default: extracted }, { default: metadata }, { default: ui }] = await Promise.all([
		import(`@/messages/${language}.po`),
		import(`@/messages/metadata/${language}/index.json`),
		import(`@dariah-eric/ui/i18n/${language}`),
	]);

	// oxlint-disable-next-line typescript/no-unsafe-member-access, typescript/no-unsafe-type-assertion
	const social = keyBy(metadata.social as SocialMedia, (item) => item.kind);

	switch (language) {
		// case "de": {
		// 	await import("@valibot/i18n/de");
		// 	break;
		// }

		// oxlint-disable-next-line typescript/no-unnecessary-condition
		case "en": {
			/** Default messages. */
			break;
		}
	}

	// oxlint-disable-next-line typescript/no-unsafe-type-assertion
	const messages = {
		...extracted,
		...ui,
		// oxlint-disable-next-line typescript/no-unsafe-assignment
		metadata: {
			...metadata,
			social,
		},
	} as IntlMessages;

	return messages;
}
