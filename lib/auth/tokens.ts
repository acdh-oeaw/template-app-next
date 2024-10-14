import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

export function generateToken(length: number): string {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);

	return token;
}
