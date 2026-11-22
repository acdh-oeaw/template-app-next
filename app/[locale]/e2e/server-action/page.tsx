import type { ReactNode } from "react";

import { ServerActionForm } from "#/app/[locale]/e2e/server-action/server-action-form.tsx";
import { MainContent } from "#/components/main-content.tsx";
import { assertE2eFixture } from "#/lib/e2e/fixtures.ts";

/** A form with a server action created with `createServerAction()`. */
export default function ServerActionFixturePage(): ReactNode {
	assertE2eFixture();

	return (
		<MainContent>
			<h1>Server action</h1>
			<ServerActionForm />
		</MainContent>
	);
}
