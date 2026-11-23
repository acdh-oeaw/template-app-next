import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";

import { type Feature, features } from "#/configs/features.ts";
import { fromRoot } from "#/configs/paths.ts";
import packageJson from "#/package.json";

const composeFile = fromRoot("docker/compose.yaml");

async function getComposeServices(): Promise<Array<string>> {
	if (!existsSync(composeFile)) {
		return [];
	}

	const compose = Bun.YAML.parse(await Bun.file(composeFile).text()) as { services?: Record<string, unknown> };

	return Object.keys(compose.services ?? {});
}

const installed = new Set([...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.devDependencies)]);

describe.each(Object.entries(features) as Array<[string, Feature]>)("feature %s", (_name, feature) => {
	test("lists paths that exist", () => {
		expect(feature.paths.filter((path) => !existsSync(fromRoot(path)))).toStrictEqual([]);
	});

	test("lists dependencies in `package.json`", () => {
		expect(feature.dependencies.filter((dependency) => !installed.has(dependency))).toStrictEqual([]);
	});

	test("lists services in `docker/compose.yaml`", async () => {
		const services = new Set(await getComposeServices());

		expect(feature.composeServices.filter((service) => !services.has(service))).toStrictEqual([]);
	});
});
