import * as v from "valibot";

import { type PublicEnv, publicEnvSchema, type ServerEnv, serverEnvSchema } from "#/configs/env.config.ts";
import { getAnnotations } from "#/lib/env/annotations.ts";

export class EnvError extends Error {
	override name = "EnvError";
}

function read(key: string): string | undefined {
	const value = process.env[key];
	return value === "" ? undefined : value;
}

function isBuildPhase(): boolean {
	return process.env.NEXT_PHASE === "phase-production-build";
}

function readAll(schema: v.ObjectSchema<v.ObjectEntries, undefined>): Record<string, string | undefined> {
	return Object.fromEntries(
		Object.keys(schema.entries).map((key) => {
			return [key, read(key)];
		}),
	);
}

function redact(issue: v.BaseIssue<unknown>): string {
	if (issue.input === undefined) {
		return issue.message;
	}

	if (issue.expected != null) {
		return `Invalid value: Expected ${issue.expected}`;
	}

	return `Invalid value: Failed \`${issue.type}\` check`;
}

function getPath(issue: v.BaseIssue<unknown>, key?: string): string {
	const path = (issue.path ?? []).map((item) => {
		return String(item.key);
	});

	return (key != null ? [key, ...path] : path).join(".");
}

function format(issues: ReadonlyArray<v.BaseIssue<unknown>>, entries: v.ObjectEntries, key?: string): string {
	const groups = new Map<string, Array<v.BaseIssue<unknown>>>();

	for (const issue of issues) {
		const path = getPath(issue, key);
		const group = groups.get(path) ?? [];
		group.push(issue);
		groups.set(path, group);
	}

	return Array.from(groups, ([path, group]) => {
		const lines = group.map((issue) => {
			return `× ${redact(issue)}`;
		});

		if (path !== "") {
			lines.push(`  → at ${path}`);
		}

		const entry = entries[path.split(".")[0]!];
		const description = entry != null ? getAnnotations(entry).description?.split("\n")[0] : undefined;
		if (description != null) {
			lines.push(`  ${description}`);
		}

		return lines.join("\n");
	}).join("\n");
}

export function assertPublicEnv(): PublicEnv {
	const result = v.safeParse(publicEnvSchema, readAll(publicEnvSchema));

	if (!result.success) {
		throw new EnvError(`Invalid public environment variables.\n\n${format(result.issues, publicEnvSchema.entries)}`);
	}

	return result.output;
}

export function assertServerEnv(): ServerEnv {
	const result = v.safeParse(serverEnvSchema, readAll(serverEnvSchema));

	if (!result.success) {
		throw new EnvError(`Invalid server environment variables.\n\n${format(result.issues, serverEnvSchema.entries)}`);
	}

	return result.output;
}

export function createServerEnv(): ServerEnv {
	const env = {} as ServerEnv;
	const cache = new Map<string, unknown>();

	for (const [key, schema] of Object.entries(serverEnvSchema.entries)) {
		Object.defineProperty(env, key, {
			enumerable: true,
			get() {
				if (cache.has(key)) {
					return cache.get(key);
				}

				const result = v.safeParse(schema, read(key));

				if (!result.success) {
					const hint = isBuildPhase()
						? `\n\n\`${key}\` was read while prerendering, so it must also be provided at build time.`
						: "";
					throw new EnvError(
						`Invalid environment variable \`${key}\`.\n\n${format(result.issues, serverEnvSchema.entries, key)}${hint}`,
					);
				}

				cache.set(key, result.output);

				return result.output;
			},
		});
	}

	return Object.freeze(env);
}
