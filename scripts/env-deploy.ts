import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";

import * as v from "valibot";

import { deployments } from "#/configs/deployments.ts";
import { type EnvValues, selectDeployEnv, serializeDotenv } from "#/lib/env/deploy.ts";
import { EnvError } from "#/lib/env/parse.ts";

const valuesSchema = v.pipe(v.string(), v.parseJson(), v.record(v.string(), v.string()));

function parseValues(key: string, input: string | undefined): EnvValues {
	const result = v.safeParse(valuesSchema, input);

	if (!result.success) {
		/** Not the issues, which contain the input. */
		throw new EnvError(`\`${key}\` must be a json object of strings.`);
	}

	return result.output;
}

const { values } = parseArgs({
	args: Bun.argv.slice(2),
	options: { environment: { type: "string" }, "out-dir": { type: "string" } },
});

const environment = v.parse(
	v.picklist(Object.keys(deployments) as Array<keyof typeof deployments>),
	values.environment,
);
const outDir = v.parse(v.string(), values["out-dir"]);

const { env: deploymentEnv, name, namespace } = deployments[environment];

try {
	const env = selectDeployEnv([
		{ name: "configs/deployments.ts", values: deploymentEnv },
		{ name: "GitHub variable", values: parseValues("DEPLOY_VARIABLES", process.env.DEPLOY_VARIABLES) },
		{ name: "GitHub secret", values: parseValues("DEPLOY_SECRETS", process.env.DEPLOY_SECRETS) },
	]);

	const files = { build: join(outDir, "build.env"), runtime: join(outDir, "runtime.json") };

	await mkdir(outDir, { recursive: true });
	await writeFile(files.build, serializeDotenv(env.build), { mode: 0o600 });
	await writeFile(files.runtime, JSON.stringify(env.runtime), { mode: 0o600 });

	const outputs = {
		"base-url": deploymentEnv.NEXT_PUBLIC_APP_BASE_URL,
		"build-env-file": files.build,
		name,
		namespace,
		"runtime-env-file": files.runtime,
	};

	if (process.env.GITHUB_OUTPUT != null) {
		const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}\n`);
		await appendFile(process.env.GITHUB_OUTPUT, lines.join(""));
	}
} catch (error) {
	if (!(error instanceof EnvError)) {
		throw error;
	}

	console.error(error.message);
	process.exitCode = 1;
}
