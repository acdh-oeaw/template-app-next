import * as v from "valibot";

import { type EnvPhase, getAnnotations } from "#/lib/env/annotations.ts";
import { EnvError, formatIssues } from "#/lib/env/parse.ts";
import { type PublicEnv, publicEnvSchema, type ServerEnv, serverEnvSchema } from "#/lib/env/schema.ts";

export type EnvValues = Record<string, string>;

/** Values are strings, like in the environment, and the base url determines the host of the ingress. */
export type DeployEnv = Partial<Record<keyof PublicEnv | keyof ServerEnv, string>> & {
	NEXT_PUBLIC_APP_BASE_URL: string;
};

export interface EnvSource {
	/** Shown in error messages. */
	name: string;
	kind: "plain" | "secret";
	values: Record<string, string | undefined>;
}

const schemas: ReadonlyArray<{ entries: v.ObjectEntries; defaultPhases: ReadonlyArray<EnvPhase> }> = [
	/** Inlined at build time. */
	{ entries: publicEnvSchema.entries, defaultPhases: ["build"] },
	{ entries: serverEnvSchema.entries, defaultPhases: ["runtime"] },
];

/**
 * Selects the values of the variables in the schemas, by the phase that needs them. Other values are ignored, because
 * GitHub also provides unrelated variables and secrets, like those of the organization.
 */
export function selectDeployEnv(sources: ReadonlyArray<EnvSource>): Record<EnvPhase, EnvValues> {
	const env: Record<EnvPhase, EnvValues> = { build: {}, runtime: {} };
	const errors: Array<string> = [];

	for (const { entries, defaultPhases } of schemas) {
		for (const [key, entry] of Object.entries(entries)) {
			const { isSecretAllowedInBuild = false, phases = defaultPhases } = getAnnotations(entry);
			const candidates = sources.filter(({ values }) => values[key] != null && values[key] !== "");
			const value = candidates[0]?.values[key];

			if (candidates.length > 1) {
				errors.push(`× Defined more than once: ${candidates.map(({ name }) => name).join(", ")}\n  → at ${key}`);
				continue;
			}

			if (phases.length === 0) {
				if (value != null) {
					errors.push(`× Not configurable for deployments\n  → at ${key}`);
				}
				continue;
			}

			if (candidates[0]?.kind === "secret" && phases.includes("build") && !isSecretAllowedInBuild) {
				errors.push(`× Secret, but the build needs it, and the image is public\n  → at ${key}`);
				continue;
			}

			const result = v.safeParse(entry, value);

			if (!result.success) {
				errors.push(formatIssues(result.issues, entries, key));
			} else if (value != null) {
				for (const phase of phases) {
					env[phase][key] = value;
				}
			}
		}
	}

	if (errors.length > 0) {
		throw new EnvError(`Invalid environment variables for the deployment.\n\n${errors.join("\n")}`);
	}

	return env;
}

/** Characters that dotenv parsers treat differently in single-quoted values. */
const unsupportedCharacters = /['$\\\r\n]/;

export function serializeDotenv(values: EnvValues): string {
	return Object.entries(values)
		.map(([key, value]) => {
			if (unsupportedCharacters.test(value)) {
				throw new EnvError(`\`${key}\` must not contain quotes, dollar signs, backslashes or line breaks.`);
			}

			return `${key}='${value}'\n`;
		})
		.join("");
}
