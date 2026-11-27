import { describe, expect, test } from "bun:test";

import * as v from "valibot";

import { getAnnotations } from "#/lib/env/annotations.ts";
import { selectDeployEnv, serializeDotenv } from "#/lib/env/deploy.ts";
import { EnvError } from "#/lib/env/parse.ts";
import { publicEnvSchema, serverEnvSchema } from "#/lib/env/schema.ts";

/** Development values, so that the test does not depend on which optional features the app keeps. */
function getRequiredValues(): Record<string, string> {
	const values: Record<string, string> = {};

	for (const [key, entry] of Object.entries({ ...publicEnvSchema.entries, ...serverEnvSchema.entries })) {
		const { dev } = getAnnotations(entry);

		if (!v.is(entry, undefined)) {
			values[key] = String(typeof dev === "function" ? (dev as () => unknown)() : dev);
		}
	}

	return values;
}

const required = getRequiredValues();
function select(variables: Record<string, string>, secrets: Record<string, string> = {}) {
	return selectDeployEnv([
		{ name: "GitHub variable", kind: "plain", values: variables },
		{ name: "GitHub secret", kind: "secret", values: secrets },
	]);
}

const key = Buffer.alloc(32).toString("base64");

describe("selectDeployEnv", () => {
	test("selects values by the phase that needs them", () => {
		const env = select(required, { NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: key });

		expect(env.build).toStrictEqual({
			NEXT_PUBLIC_APP_BASE_URL: required.NEXT_PUBLIC_APP_BASE_URL!,
			NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: key,
			SERVICE_ID: required.SERVICE_ID!,
		});
		expect(env.runtime).toContainKey("SERVICE_ID");
		expect(env.runtime).not.toContainAnyKeys(["NEXT_PUBLIC_APP_BASE_URL", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY"]);
	});

	test("ignores values that are not in the schemas", () => {
		const env = select(required, { KUBE_CONFIG: "secret" });

		expect(JSON.stringify(env)).not.toContain("KUBE_CONFIG");
	});

	test("treats empty values as missing", () => {
		expect(() => select({ ...required, SERVICE_ID: "" })).toThrow(/at SERVICE_ID/);
	});

	test("reports every missing value", () => {
		expect(() => select({})).toThrow(/at NEXT_PUBLIC_APP_BASE_URL.*at SERVICE_ID/s);
	});

	test("does not include values in error messages", () => {
		expect(() => select(required, { NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: "hunter2" })).toThrow(
			expect.objectContaining({ message: expect.not.stringContaining("hunter2") as string }),
		);
	});

	test("rejects values defined more than once", () => {
		expect(() => select(required, { SERVICE_ID: "1" })).toThrow(/more than once: GitHub variable, GitHub secret/);
	});

	test("rejects secrets that the build needs", () => {
		const { SERVICE_ID, ...variables } = required;

		expect(() => select(variables, { SERVICE_ID: SERVICE_ID! })).toThrow(/image is public\n.*at SERVICE_ID/);
	});

	test("rejects values that deployments cannot configure", () => {
		expect(() => select({ ...required, BUILD_TARGET: "e2e" })).toThrow(/at BUILD_TARGET/);
	});
});

describe("serializeDotenv", () => {
	test("quotes values", () => {
		expect(serializeDotenv({ A: "https://example.com/?a=b#c", B: "a b" })).toBe(
			"A='https://example.com/?a=b#c'\nB='a b'\n",
		);
	});

	test.each(["it's", "$HOME", String.raw`a\b`, "a\nb"])("rejects %j", (value) => {
		expect(() => serializeDotenv({ A: value })).toThrow(EnvError);
	});
});
