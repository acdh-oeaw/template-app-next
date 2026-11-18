import * as path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.resolve("#/package.json")));

/** Some tools resolve relative paths against `configs/`, like oxlint for globs in `overrides`, not the repository root. */
export function fromRoot(pattern: string): string {
	return path.join(root, pattern);
}
