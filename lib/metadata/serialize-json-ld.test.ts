import { describe, expect, test } from "bun:test";

import { serializeJsonLd } from "#/lib/metadata/serialize-json-ld.ts";

describe("serializeJsonLd", () => {
	test("escapes strings that would close the script element", () => {
		const data = { "@context": "https://schema.org", "@type": "WebSite", name: "</script><script>alert(1)" } as const;

		const serialized = serializeJsonLd(data);

		expect(serialized).not.toContain("<");
		expect(JSON.parse(serialized)).toStrictEqual(data);
	});
});
