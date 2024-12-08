export function createKey(...segments: Array<string>): string {
	return segments.join(":");
}
