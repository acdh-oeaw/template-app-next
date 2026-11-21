import { expect, test } from "bun:test";

import { fromRoot } from "#/configs/paths.ts";

/** Below the root layout's segment, like `app/[locale]/e2e/`, or directly in `app/e2e/` without i18n routing. */
const fixturePages = [new Bun.Glob("e2e/**/page.tsx"), new Bun.Glob("*/e2e/**/page.tsx")];

test("every fixture page calls assertE2eFixture()", async () => {
	const scans = fixturePages.map((glob) => Array.fromAsync(glob.scan({ cwd: fromRoot("app") })));
	const pages = (await Promise.all(scans)).flat();

	expect(pages.length).toBeGreaterThan(0);

	const sources = await Promise.all(pages.map((page) => Bun.file(fromRoot(`app/${page}`)).text()));

	for (const [index, source] of sources.entries()) {
		expect(source, pages[index]).toContain("assertE2eFixture();");
	}
});
