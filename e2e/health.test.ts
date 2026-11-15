import { expect, test } from "@playwright/test";

test.describe("health checks", () => {
	for (const pathname of ["/api/health/live", "/api/health/ready"]) {
		/** The proxy `matcher` must exclude `/api/`, so `maxRedirects: 0` also catches locale redirects. */
		test(`${pathname} responds with ok`, async ({ request }) => {
			const response = await request.get(pathname, { maxRedirects: 0 });
			expect(response.status()).toBe(200);
			expect(response.headers()["cache-control"]).toContain("no-store");
			expect(await response.json()).toEqual({ status: "ok" });
		});
	}
});
