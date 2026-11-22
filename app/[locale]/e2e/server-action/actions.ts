"use server";

import { cookies } from "next/headers";
import * as v from "valibot";

import { assertE2eFixture } from "#/lib/e2e/fixtures.ts";
import { href } from "#/lib/navigation/href.ts";
import { redirect } from "#/lib/navigation/navigation.ts";
import { TimeoutError } from "#/lib/request/errors.ts";
import { ActionError } from "#/lib/server-actions/action-error.ts";
import { createServerAction } from "#/lib/server-actions/create-server-action.ts";

/** Each submit button sends an `outcome`, which decides how the handler responds. */
export const serverActionFixture = createServerAction({
	async guard() {
		/** The action is reachable in every build, the fixture page only in e2e builds. */
		assertE2eFixture();

		const cookieStore = await cookies();

		if (cookieStore.get("e2e-authorization")?.value === "denied") {
			throw new ActionError("You are not allowed to do this.");
		}

		return { user: cookieStore.get("e2e-user")?.value };
	},
	schema() {
		return v.pipeAsync(
			v.object({
				name: v.pipe(v.string(), v.trim(), v.nonEmpty("Enter a name.")),
				/** Without a message, to show the translated fallback. */
				nickname: v.pipe(v.string(), v.maxLength(10)),
				password: v.string(),
				outcome: v.picklist(["success", "action-error", "error", "timeout", "validation-timeout", "redirect"]),
			}),
			/** Like a check that makes a request, such as whether a name is taken. */
			// oxlint-disable-next-line require-await -- async checks return a promise
			v.checkAsync(async (input) => {
				if (input.outcome === "validation-timeout") {
					throw new TimeoutError({ method: "GET", url: "https://example.com" });
				}

				return true;
			}),
		);
	},
	omitValues: ["password"],
	// oxlint-disable-next-line require-await -- server actions are async
	async handler(input, { locale, user }) {
		switch (input.outcome) {
			case "success": {
				return { name: input.name, user };
			}

			case "action-error": {
				throw new ActionError("This name is taken.", { fieldErrors: { name: ["Choose another name."] } });
			}

			case "error": {
				throw new Error("Internal error message");
			}

			case "timeout": {
				throw new TimeoutError({ method: "GET", url: "https://example.com" });
			}

			case "validation-timeout": {
				throw new Error("The schema throws for this outcome.");
			}

			case "redirect": {
				return redirect({ href: href({ pathname: "/" }), locale });
			}
		}
	},
});
