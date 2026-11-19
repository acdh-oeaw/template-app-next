import "server-only";

import { notFound } from "next/navigation";

import { env } from "#/lib/env/server.ts";

/**
 * Responds with 404 unless the app was built for the end-to-end tests. Call it first in each fixture page in
 * `app/[locale]/e2e/`, not in a layout, because Next.js renders a page even when its layout calls `notFound()`.
 */
export function assertE2eFixture(): void {
	if (env.BUILD_TARGET !== "e2e") {
		notFound();
	}
}
