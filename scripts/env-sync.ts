import { parseArgs } from "node:util";

import * as v from "valibot";

import { publicEnvSchema, serverEnvSchema } from "#/configs/env.config.ts";
import { getAnnotations } from "#/lib/env/annotations.ts";

const filePath = ".env.local";

const headingRule = `# ${"=".repeat(78)}`;

const sections: Array<{
	title: string;
	description: string;
	schema: v.ObjectSchema<v.ObjectEntries, undefined>;
}> = [
	{
		title: "PUBLIC",
		description: "Inlined into client and server bundles at build time.",
		schema: publicEnvSchema,
	},
	{
		title: "SERVER",
		description: "Must be provided at runtime, and at build time when read while prerendering.",
		schema: serverEnvSchema,
	},
];

function getDevValue(key: string, dev: unknown): string | undefined {
	if (dev == null) {
		return undefined;
	}

	const value = typeof dev === "function" ? (dev as () => unknown)() : dev;

	if (typeof value !== "string") {
		throw new Error(`Development value of \`${key}\` must be a string, or a function returning a string.`);
	}

	return value;
}

function isRequired(entry: v.GenericSchema): boolean {
	return getAnnotations(entry).default.kind === "none" && !v.is(entry, undefined);
}

/** Whether `key` is assigned or commented out. */
function mentions(content: string, key: string): boolean {
	return content.split("\n").some((line) => {
		let rest = line.trim();
		if (rest.startsWith("#")) {
			rest = rest.slice(1).trimStart();
		}
		if (rest.startsWith("export ")) {
			rest = rest.slice("export ".length).trimStart();
		}
		return rest.startsWith(key) && rest.slice(key.length).trimStart().startsWith("=");
	});
}

function render(key: string, entry: v.GenericSchema): { lines: Array<string>; hasValue: boolean } {
	const { allowed, default: defaultValue, description, dev } = getAnnotations(entry);
	const lines: Array<string> = [];

	if (description != null) {
		for (const line of description.split("\n")) {
			lines.push(`# ${line}`);
		}
	}
	if (allowed != null) {
		const values = allowed.map((value) => {
			return JSON.stringify(value);
		});
		lines.push(`# Allowed: ${values.join(" | ")}`);
	}
	if (defaultValue.kind === "dynamic") {
		lines.push("# Default: computed at runtime");
	}

	const devValue = getDevValue(key, dev);

	if (devValue != null) {
		lines.push(`${key}=${JSON.stringify(devValue)}`);
		return { lines, hasValue: true };
	}

	if (defaultValue.kind === "static") {
		const value = defaultValue.value;
		lines.push(`# ${key}=${JSON.stringify(typeof value === "string" ? value : JSON.stringify(value))}`);
	} else if (isRequired(entry)) {
		lines.push(`${key}=`);
	} else {
		lines.push(`# ${key}=`);
	}

	return { lines, hasValue: false };
}

async function main(): Promise<void> {
	if (process.env.CI != null && process.env.CI !== "" && process.env.CI !== "false") {
		console.log(`Skipping \`${filePath}\` in CI.`);
		return;
	}

	const { values } = parseArgs({
		args: Bun.argv.slice(2),
		options: { force: { type: "boolean", default: false } },
	});
	const force = values.force;

	const file = Bun.file(filePath);
	const exists = await file.exists();
	const content = exists && !force ? await file.text() : "";

	const lines: Array<string> = [];
	const added: Array<string> = [];
	const written = new Set<string>();

	if (content === "") {
		lines.push(
			"# Generated from `configs/env.config.ts` by `bun run env:sync`.",
			"#",
			"# Running `bun run env:sync` again only appends missing variables.",
			"# `bun run env:sync --force` overwrites this file, including all values.",
			"# Commented out variables are optional, or have a default in the schema.",
		);
	}

	for (const section of sections) {
		const block: Array<string> = [];

		for (const [key, entry] of Object.entries(section.schema.entries)) {
			if (content !== "" && mentions(content, key)) {
				continue;
			}

			const result = render(key, entry);
			block.push("", ...result.lines);
			added.push(key);
			if (result.hasValue) {
				written.add(key);
			}
		}

		if (content === "") {
			lines.push("", headingRule, `# ${section.title}`, `# ${section.description}`, headingRule);
		}
		lines.push(...block);
	}

	if (content === "") {
		await Bun.write(filePath, `${lines.join("\n")}\n`);
		console.log(`${exists ? "Overwrote" : "Created"} \`${filePath}\`.`);
	} else if (added.length > 0) {
		const separator = content.endsWith("\n") ? "" : "\n";
		await Bun.write(filePath, `${content}${separator}${lines.join("\n")}\n`);
		console.log(`Added ${added.join(", ")} to \`${filePath}\`.`);
	} else {
		console.log(`\`${filePath}\` is up to date.`);
	}

	const missing = sections.flatMap((section) => {
		return Object.entries(section.schema.entries)
			.filter(([key, entry]) => {
				const value = force ? undefined : process.env[key];
				return isRequired(entry) && !written.has(key) && (value == null || value === "");
			})
			.map(([key]) => {
				return key;
			});
	});

	if (missing.length > 0) {
		console.warn(`Missing required environment variables: ${missing.join(", ")}.`);
	}
}

await main();
