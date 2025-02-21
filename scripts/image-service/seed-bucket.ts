import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

import { log } from "@acdh-oeaw/lib";
import slugify from "@sindresorhus/slugify";
import sharp from "sharp";
import { v7 as uuidv7 } from "uuid";
import * as v from "valibot";

import { env } from "@/config/env.config";
import { createMinioClient } from "@/lib/server/images/create-minio-client";

const ArgsSchema = v.object(
	{ folder: v.pipe(v.string(), v.nonEmpty()) },
	"Please provide a valid image folder path via `--folder`",
);

async function seed() {
	const { values } = parseArgs({ options: { folder: { type: "string", short: "f" } } });
	const { folder } = v.parse(ArgsSchema, values);
	const imagesFolder = resolve(folder);

	const bucketName = env.S3_BUCKET;
	const client = createMinioClient();

	if (!(await client.bucketExists(bucketName))) {
		await client.makeBucket(bucketName);
	}

	for (const entry of await readdir(imagesFolder, { withFileTypes: true })) {
		if (!entry.isFile()) continue;

		const imageFilePath = join(imagesFolder, entry.name);

		const inputStream = createReadStream(imageFilePath);
		const imageStream = inputStream.pipe(sharp());
		const { format, size } = await imageStream.metadata();

		const objectName = `${uuidv7()}-${slugify(entry.name)}`;
		const metadata = format ? { "Content-Type": `image/${format}` } : undefined;

		/**
		 * Intentionally not just using `client.fPutObject`, because that derives the mime type
		 * from the file extension.
		 */
		// await client.fPutObject(bucketName, objectName, imageFilePath);

		await client.putObject(bucketName, objectName, imageStream, size, metadata);
	}
}

seed()
	.then(() => {
		log.success("Successfully uploaded images.");
	})
	.catch((error: unknown) => {
		log.error("Failed to upload images.\n", String(error));
		process.exitCode = 1;
	});
