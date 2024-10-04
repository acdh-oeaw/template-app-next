import { log } from "@acdh-oeaw/lib";

import { db } from "@/db";

async function main() {}

main()
	.then(() => {
		log.success("Successfully cleared database.");
	})
	.catch((error: unknown) => {
		log.error("Failed to clear database.\n", String(error));
		process.exitCode = 1;
	});
