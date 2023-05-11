import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
	const messages = (await import(`@/messages/${locale}.json`)).default;
	const timeZone = "UTC";

	return {
		messages,
		timeZone,
	};
});
