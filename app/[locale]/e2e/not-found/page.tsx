import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { assertE2eFixture } from "#/lib/e2e/fixtures.ts";

/** Calls `notFound()`, caught by `app/[locale]/not-found.tsx`. */
export default function NotFoundFixturePage(): ReactNode {
	assertE2eFixture();

	notFound();
}
