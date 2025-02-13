import { assert, includes } from "@acdh-oeaw/lib";
import type { NextRequest } from "next/server";
import { Octokit } from "octokit";
import * as v from "valibot";

import { env } from "@/config/env.config";
import { ForbiddenError } from "@/lib/server/errors";

/** @see https://docs.github.com/de/rest/collaborators/collaborators?apiVersion=2022-11-28#get-repository-permissions-for-a-user */
const allowedRoles = ["push", "maintain", "admin"] as const;

const headers = { "X-GitHub-Api-Version": "2022-11-28" };

const AccessTokenInputSchema = v.pipe(v.string(), v.nonEmpty());

/**
 * Image service api routes need to be authenticated, since we neither want public read/write
 * access to the object store (`s3` bucket), nor public usage of the `imgproxy` image
 * optimisation service.
 *
 * For integrating the image service api routes with `keystatic` we can read the github
 * access token from the `keystatic-gh-access-token` and retrieve the permissions of the
 * that token via github api.
 */
export async function assertImageServicePermissions(request: NextRequest): Promise<void> {
	try {
		const token = request.cookies.get("keystatic-gh-access-token");
		const auth = await v.parseAsync(AccessTokenInputSchema, token?.value);

		const owner = env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER;
		const repo = env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME;

		assert(owner, "Missing NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER environment variable.");
		assert(repo, "Missing NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME environment variable.");

		const octokit = new Octokit({ auth });

		const user = await octokit.request("GET /user", { headers });
		const username = user.data.login;

		const permission = await octokit.request(
			"GET /repos/{owner}/{repo}/collaborators/{username}/permission",
			{ owner, repo, username, headers },
		);
		const role = permission.data.permission;

		if (includes(allowedRoles, role)) {
			return;
		}
	} catch {
		/** noop */
	}

	throw new ForbiddenError();
}
