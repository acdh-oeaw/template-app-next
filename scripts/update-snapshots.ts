import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { $ } from "bun";
import * as v from "valibot";

const workflow = "validate.yaml";
const artifactName = "snapshots";
const snapshotsDir = "e2e/snapshots";

const runsSchema = v.array(v.object({ databaseId: v.number(), createdAt: v.string() }));

async function findRun(branch: string, commit: string, dispatchedAt: Date): Promise<number> {
	const deadline = Date.now() + 60 * 1000;

	while (Date.now() < deadline) {
		await Bun.sleep(3000);

		const output: unknown =
			await $`gh run list --workflow ${workflow} --branch ${branch} --commit ${commit} --event workflow_dispatch --json databaseId,createdAt`.json();
		const run = v.parse(runsSchema, output).find((run) => {
			return new Date(run.createdAt) >= dispatchedAt;
		});

		if (run != null) {
			return run.databaseId;
		}
	}

	throw new Error("Timed out waiting for the workflow run to start.");
}

async function main(): Promise<void> {
	const branch = (await $`git branch --show-current`.text()).trim();
	const commit = (await $`git rev-parse HEAD`.text()).trim();
	const remoteCommit = (await $`git ls-remote origin refs/heads/${branch}`.text()).split("\t")[0];

	if (remoteCommit !== commit) {
		throw new Error(`Push \`${branch}\` first: the workflow runs on the remote branch, which differs from \`HEAD\`.`);
	}

	// Run timestamps have second precision.
	const dispatchedAt = new Date(Math.floor(Date.now() / 1000) * 1000);
	await $`gh workflow run ${workflow} --ref ${branch} -f update-snapshots=true`;

	const runId = await findRun(branch, commit, dispatchedAt);

	// Snapshots are uploaded even when unrelated tests fail, so continue and let the download decide.
	const { exitCode } = await $`gh run watch ${runId} --exit-status`.nothrow();
	if (exitCode !== 0) {
		console.warn(`Workflow run ${String(runId)} failed, downloading snapshots anyway.`);
	}

	const downloadDir = await mkdtemp(join(tmpdir(), "snapshots-"));
	try {
		await $`gh run download ${runId} --name ${artifactName} --dir ${downloadDir}`;
		await rm(snapshotsDir, { recursive: true, force: true });
		await cp(downloadDir, snapshotsDir, { recursive: true });
	} finally {
		await rm(downloadDir, { recursive: true, force: true });
	}

	console.log(`Updated \`${snapshotsDir}\`. Review the changes with \`git status\` before committing.`);
}

await main();
