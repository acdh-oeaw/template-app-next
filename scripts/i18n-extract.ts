import { unstable_extractMessages as extractMessages } from "next-intl/extractor";

import { extractorConfig } from "#/lib/i18n/extractor-config.ts";

await extractMessages(extractorConfig);
