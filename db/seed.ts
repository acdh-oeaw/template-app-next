import { log } from "@acdh-oeaw/lib";

import { db } from "@/db";

async function main() {}

main()
	.then(() => {
		log.success("Successfully seeded database.");
	})
	.catch((error: unknown) => {
		log.error("Failed to seed database.\n", String(error));
		process.exitCode = 1;
	});
