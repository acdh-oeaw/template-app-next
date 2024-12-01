import { createAssetOptions, type Paths, withI18nPrefix } from "@acdh-oeaw/keystatic-lib";
import { fields } from "@keystatic/core";

import type { Locale } from "@/config/i18n.config";
import { linkKinds } from "@/lib/content/options";
import * as validation from "@/lib/keystatic/validation";

export function createLinkSchema<TPath extends `/${string}/`>(
	downloadPath: Paths<TPath>["downloadPath"],
	locale: Locale,
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
				collection: withI18nPrefix("documentation", locale),
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
