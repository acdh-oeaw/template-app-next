import { log } from "@acdh-oeaw/lib";

import { env } from "@/config/env.config";
import { createMinioClient } from "@/lib/server/images/create-minio-client";

async function create() {
	const bucketName = env.S3_BUCKET;
	const client = createMinioClient();

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
