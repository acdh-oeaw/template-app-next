import { basename } from "node:path";

import * as v from "valibot";

const packageJsonSchema = v.object({
	devDependencies: v.object({
		"@playwright/test": v.pipe(
			v.string(),
			v.regex(/^\d+\.\d+\.\d+$/, "Pin `@playwright/test` to an exact version, which selects the container image."),
		),
	}),
	devEngines: v.object({ runtime: v.object({ version: v.string() }) }),
});

const pkg = v.parse(packageJsonSchema, await Bun.file("package.json").json());

// Keep in sync with `.github/workflows/validate.yaml`.
const image = `mcr.microsoft.com/playwright:v${pkg.devDependencies["@playwright/test"]}-resolute`;
const bunVersion = pkg.devEngines.runtime.version.replace(/^\^/, "");

const volumePrefix = basename(process.cwd())
	.toLowerCase()
	.replaceAll(/[^a-z0-9_.-]/g, "-");
const owner = `${String(process.getuid?.() ?? 0)}:${String(process.getgid?.() ?? 0)}`;

// Dependencies are installed without lifecycle scripts, which would write to the repository as root, like git hooks.
const script = `
set -e
trap 'chown -R ${owner} e2e/snapshots test-results playwright-report 2>/dev/null || true' EXIT
export PATH="$HOME/.local/bin:$PATH"
if [ "$(bun --version 2>/dev/null)" != "${bunVersion}" ]; then
	npm install --global --prefix "$HOME/.local" --silent bun@${bunVersion}
fi
bun install --frozen-lockfile --ignore-scripts
bun run types:prepare
bun run test:e2e "$@"
`;

const proc = Bun.spawn(
	[
		"docker",
		"run",
		"--rm",
		"--init",
		// Chromium can run out of shared memory otherwise.
		"--ipc=host",
		// CI runs on x64, and rendering can differ on arm64.
		"--platform=linux/amd64",
		"--env=PLAYWRIGHT_CONTAINER=true",
		`--volume=${process.cwd()}:/work`,
		// Native dependencies and build output differ from the host, so they live in volumes.
		`--volume=${volumePrefix}-e2e-node-modules:/work/node_modules`,
		`--volume=${volumePrefix}-e2e-next:/work/.next`,
		// Caches bun and its package cache between runs.
		`--volume=${volumePrefix}-e2e-home:/root`,
		"--workdir=/work",
		image,
		"bash",
		"-c",
		script,
		"bash",
		...process.argv.slice(2),
	],
	{ stdio: ["inherit", "inherit", "inherit"] },
);

process.exitCode = await proc.exited;
