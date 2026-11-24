import { defineConfig } from "@eloqnt/cli";

import { extractorConfig } from "#/lib/i18n/extractor-config.ts";

export default defineConfig({
	messages: extractorConfig.messages,
	srcPath: extractorConfig.srcPath,
});
