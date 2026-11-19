import { expect, test } from "bun:test";

import { fromRoot } from "#/configs/paths.ts";

test("every fixture page calls assertE2eFixture()", async () => {
	const glob = new Bun.Glob("**/page.tsx");
	const pages = await Array.fromAsync(glob.scan({ cwd: fromRoot("app/[locale]/e2e") }));

	expect(pages.length).toBeGreaterThan(0);

	const sources = await Promise.all(pages.map((page) => Bun.file(fromRoot(`app/[locale]/e2e/${page}`)).text()));

	for (const [index, source] of sources.entries()) {
		expect(source, pages[index]).toContain("assertE2eFixture();");
	}
});
