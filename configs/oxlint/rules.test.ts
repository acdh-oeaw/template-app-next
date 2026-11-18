import { afterAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import config from "#/configs/oxlint.config.ts";

interface JsPlugin {
	name: string;
	specifier: string;
}

interface Config {
	jsPlugins?: Array<JsPlugin>;
	rules?: Record<string, unknown>;
	overrides?: Array<{ jsPlugins?: Array<JsPlugin>; rules?: Record<string, unknown> }>;
}

/** Configs whose rules only apply to some files declare them in their only override. */
function ruleNames(config: Config): Array<string> {
	return Object.keys(config.rules ?? config.overrides?.[0]?.rules ?? {});
}

function jsPluginsOf(config: Config): Array<JsPlugin> {
	return config.jsPlugins ?? config.overrides?.[0]?.jsPlugins ?? [];
}

/** Listed by `bun lint --rules`, but not configured, so not reported as missing. */
const ignoredPlugins = new Set([
	/** Only available in an ESLint config. */
	"json",
	"markdown",
	"prettier",
	/** Tests use `bun:test`. */
	"jest",
	"vitest",
]);

function normalize(name: string): string {
	return name
		.replace(/^eslint\//, "")
		.replace(/^jsx_a11y\//, "jsx-a11y/")
		.replace(/^react_perf\//, "react-perf/");
}

function pluginOf(name: string): string {
	return name.includes("/") ? name.slice(0, name.indexOf("/")) : "eslint";
}

async function bunLint(args: Array<string>, cwd?: string): Promise<string> {
	const subprocess = Bun.spawn(["bun", "lint", ...args], { cwd, stderr: "pipe", stdout: "pipe" });
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(subprocess.stdout).text(),
		new Response(subprocess.stderr).text(),
		subprocess.exited,
	]);
	if (exitCode !== 0) {
		throw new Error(`\`bun lint ${args.join(" ")}\` exited with ${String(exitCode)}:\n${stderr}`);
	}
	return stdout;
}

/**
 * Resolves rule names the way an oxlint config does. Some names are aliases of another rule, e.g.
 * `typescript/no-unused-vars` of `no-unused-vars`, so setting both makes the later one win.
 */
async function resolve(names: Array<string>): Promise<Set<string>> {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), "oxlint-rules-"));
	try {
		const rules = Object.fromEntries(names.map((name) => [name, "error"]));
		const plugins = [...new Set(names.map((name) => pluginOf(name)))].filter((plugin) => !plugin.startsWith("bun"));
		await Bun.write(path.join(directory, ".oxlintrc.json"), JSON.stringify({ plugins, rules }));
		await Bun.write(path.join(directory, "index.ts"), "");
		const output = JSON.parse(await bunLint(["--print-config", "index.ts"], directory)) as Config;
		return new Set(Object.keys(output.rules ?? {}).map((name) => normalize(name)));
	} finally {
		await fs.rm(directory, { force: true, recursive: true });
	}
}

const configs: Array<Config> = [...config.extends, { rules: config.rules }];

async function getAvailableRules(): Promise<Set<string>> {
	const listed = (await bunLint(["--rules"]))
		.trim()
		.split("\n")
		.map((name) => normalize(name))
		.filter((name) => !ignoredPlugins.has(pluginOf(name)));
	const pluginRules = await Promise.all(
		configs
			.flatMap((config) => jsPluginsOf(config))
			.map(async ({ name, specifier }) => {
				const plugin = (await import(specifier)) as { default: { rules: Record<string, unknown> } };
				return Object.keys(plugin.default.rules).map((rule) => `${name}/${rule}`);
			}),
	);
	return new Set([...(await resolve(listed)), ...pluginRules.flat()]);
}

describe("oxlint config", () => {
	const configured = configs.flatMap((config) => ruleNames(config));
	const available = getAvailableRules();

	/** A Bun or plugin upgrade can add rules, which stay off until they are configured. */
	afterAll(async () => {
		const names = new Set(configured);
		const missing = [...(await available)].filter((name) => !names.has(name)).toSorted();
		if (missing.length > 0) {
			// oxlint-disable-next-line no-console -- reports new rules without failing the tests
			console.warn(`Rules not configured in \`configs/oxlint/\`:\n${missing.join("\n")}`);
		}
	});

	test("configures every rule only once", () => {
		expect(configured.filter((name, index) => configured.indexOf(name) !== index)).toStrictEqual([]);
	});

	/** An alias overrides the setting of the rule it stands for, and an unknown rule makes `bun lint` exit early. */
	test("sets every rule by its own name", async () => {
		const rules = await available;
		expect(configured.filter((name) => !rules.has(name)).toSorted()).toStrictEqual([]);
	});
});
