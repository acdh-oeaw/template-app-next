import { log } from "@acdh-oeaw/lib";

import { client } from "@/lib/server/images/create-client";
import { env } from "@/config/env.config";

async function create() {
	const bucketName = env.S3_BUCKET;

	if (!(await client.bucketExists(bucketName))) {
		await client.makeBucket(bucketName);
	}
}

create()
	.then(() => {
		log.success("Successfully created bucket.");
	})
	.catch((error: unknown) => {
		log.error("Failed to create bucket.\n", String(error));
		process.exitCode = 1;
	});
