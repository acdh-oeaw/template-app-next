import * as path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.resolve("#/package.json")));

/** Relative globs in `overrides` are resolved against `configs/`, not the repository root. */
export function fromRoot(pattern: string): string {
	return path.join(root, pattern);
}
