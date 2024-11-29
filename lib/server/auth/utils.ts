import { getRandomValues } from "node:crypto";

import { encodeBase32UpperCaseNoPadding } from "@oslojs/encoding";

export function generateRandomOTP(): string {
	const bytes = new Uint8Array(5);
	getRandomValues(bytes);
	const code = encodeBase32UpperCaseNoPadding(bytes);

	return code;
}

export function generateRandomRecoveryCode(): string {
	const recoveryCodeBytes = new Uint8Array(10);
	getRandomValues(recoveryCodeBytes);
	const recoveryCode = encodeBase32UpperCaseNoPadding(recoveryCodeBytes);

	return recoveryCode;
}
