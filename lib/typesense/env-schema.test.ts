import { expect, test } from "bun:test";

import { type Deployment, deployments } from "#/configs/deployments.ts";

/** Deployments share a Typesense server. */
test("deployments have different collections", () => {
	const all: Array<Deployment> = Object.values(deployments);
	const collections = all.map(({ env }) => env.TYPESENSE_COLLECTION);

	expect(new Set(collections).size).toBe(collections.length);
});
