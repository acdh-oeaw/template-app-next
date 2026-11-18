import { afterAll, describe, expect, test } from "bun:test";

import stylelint from "stylelint";
import order from "stylelint-order";

import config from "#/configs/stylelint.config.ts";

describe("stylelint config", () => {
	const available = [...Object.keys(stylelint.rules), ...order.map((plugin) => plugin.ruleName)];
	const configured = Object.keys(config.rules ?? {});

	/** A stylelint or plugin upgrade can add rules, which stay off until they are configured. */
	afterAll(() => {
		const names = new Set(configured);
		const missing = available.filter((name) => !names.has(name)).toSorted();
		if (missing.length > 0) {
			// oxlint-disable-next-line no-console -- reports new rules without failing the tests
			console.warn(`Rules not configured in \`configs/stylelint.config.ts\`:\n${missing.join("\n")}`);
		}
	});

	test("only sets rules that exist", () => {
		const names = new Set(available);
		expect(configured.filter((name) => !names.has(name))).toStrictEqual([]);
	});
});
