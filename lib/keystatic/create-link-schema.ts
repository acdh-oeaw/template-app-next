import { createAssetOptions, type Paths, withI18nPrefix } from "@acdh-oeaw/keystatic-lib";
import { fields } from "@keystatic/core";

import { linkKinds } from "@/lib/content/options";
import type { IntlLanguage } from "@/lib/i18n/locales";
import * as validation from "@/lib/keystatic/validation";

export function createLinkSchema<TPath extends `/${string}/`>(
	downloadPath: Paths<TPath>["downloadPath"],
	language: IntlLanguage,
) {
	return fields.conditional(
		fields.select({
			label: "Kind",
			options: linkKinds,
			defaultValue: "external",
		}),
		{
			documentation: fields.relationship({
				label: "Documentation",
				validation: { isRequired: true },
				collection: withI18nPrefix("documentation", language),
			}),
			download: fields.file({
				label: "Download",
				validation: { isRequired: true },
				...createAssetOptions(downloadPath),
			}),
			email: fields.text({
				label: "Email",
				validation: { isRequired: true, pattern: validation.email },
			}),
			external: fields.url({
				label: "URL",
				validation: { isRequired: true },
			}),
			"url-fragment-id": fields.text({
				label: "Identifier",
				validation: { isRequired: true, pattern: validation.urlFragment },
			}),
		},
	);
}
