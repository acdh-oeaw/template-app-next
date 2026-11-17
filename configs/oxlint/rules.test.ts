import { describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import playwrightPlugin from "eslint-plugin-playwright";
import regexpPlugin from "eslint-plugin-regexp";
import tailwindcssPlugin from "oxlint-tailwindcss";

import config from "#/configs/oxlint.config.ts";
import { base } from "#/configs/oxlint/base.ts";
import { bunTest } from "#/configs/oxlint/bun-test.ts";
import { nextjs } from "#/configs/oxlint/nextjs.ts";
import { playwright } from "#/configs/oxlint/playwright.ts";
import { react } from "#/configs/oxlint/react.ts";
import { regexp } from "#/configs/oxlint/regexp.ts";
import { tailwindcss } from "#/configs/oxlint/tailwindcss.ts";

interface Config {
	rules?: Record<string, unknown>;
	overrides?: Array<{ rules?: Record<string, unknown> }>;
}

/** Configs whose rules only apply to some files declare them in their only override. */
function ruleNames(config: Config): Array<string> {
	return Object.keys(config.rules ?? config.overrides?.[0]?.rules ?? {});
}

const nativePlugins = new Set([
	"bun",
	"bun:test",
	"eslint",
	"import",
	"jsx-a11y",
	"nextjs",
	"node",
	"oxc",
	"promise",
	"react",
	"react-perf",
	"typescript",
	"unicorn",
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
	const [stdout, exitCode] = await Promise.all([new Response(subprocess.stdout).text(), subprocess.exited]);
	expect(exitCode).toBe(0);
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

describe("oxlint config", () => {
	const native = [base, bunTest, nextjs, react, { rules: config.rules }].flatMap((config) => ruleNames(config));

	test("configures every rule only once", () => {
		const names = [native, ...[playwright, regexp, tailwindcss].map((config) => ruleNames(config))].flat();
		expect(names.filter((name, index) => names.indexOf(name) !== index)).toStrictEqual([]);
	});

	test("configures every built-in rule by its own name", async () => {
		const listed = (await bunLint(["--rules"]))
			.trim()
			.split("\n")
			.map((name) => normalize(name))
			.filter((name) => nativePlugins.has(pluginOf(name)));
		const canonical = await resolve(listed);
		const configured = new Set(native);

		expect([...canonical].filter((name) => !configured.has(name)).toSorted()).toStrictEqual([]);
		expect(native.filter((name) => !canonical.has(name)).toSorted()).toStrictEqual([]);
	});

	test.each([
		["playwright", playwright, playwrightPlugin],
		["regexp", regexp, regexpPlugin],
		["tailwindcss", tailwindcss, tailwindcssPlugin],
	] as const)("configures every rule of the %s plugin", (prefix, config, plugin) => {
		const expected = Object.keys(plugin.rules).map((rule) => `${prefix}/${rule}`);
		expect(ruleNames(config).toSorted()).toStrictEqual(expected.toSorted());
	});
});
