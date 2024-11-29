export function ensureTrailingSlash(pathname: string): string {
	if (pathname === "/" || pathname.endsWith("/")) return pathname;
	return `${pathname}/`;
}
