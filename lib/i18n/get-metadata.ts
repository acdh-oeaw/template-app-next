import { getMessages } from "next-intl/server";

export async function getMetadata() {
	const messages = (await getMessages()) as unknown as IntlMessages;

	const metadata = messages.metadata;

	const social: Record<string, string> = {};
	messages.metadata.social.forEach((entry) => {
		social[entry.kind] = entry.href;
	});

	return { ...metadata, social };
}
