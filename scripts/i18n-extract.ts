import { unstable_extractMessages as extractMessages } from "next-intl/extractor";

import { extractorConfig } from "#/configs/i18n.config.ts";

await extractMessages(extractorConfig);
