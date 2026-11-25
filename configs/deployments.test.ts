import { expect, test } from "bun:test";

import { type Deployment, deployments } from "#/configs/deployments.ts";

const all: Array<Deployment> = Object.values(deployments);

function getDuplicates(values: Array<string>): Array<string> {
	return values.filter((value, index) => values.indexOf(value) !== index);
}

test("deployments have different hosts", () => {
	expect(getDuplicates(all.map(({ env }) => new URL(env.NEXT_PUBLIC_APP_BASE_URL).host))).toStrictEqual([]);
});

/** Also in different namespaces, so that moving them into one is safe. */
test("deployments have different names", () => {
	expect(getDuplicates(all.map(({ name }) => name))).toStrictEqual([]);
});

/** Labels are limited to 63 characters, and the name of the secret adds a suffix. */
test.each(all.map(({ name }) => name))("%s is a valid resource name", (name) => {
	expect(name).toMatch(/^[a-z](?:[-a-z0-9]{0,38}[a-z0-9])?$/);
});
