import { HttpError } from "@acdh-oeaw/lib";

export class HoneypotError extends Error {
	name = "HoneypotError" as const;
}

export function isHoneypotError(error: unknown): error is HoneypotError {
	return error instanceof HoneypotError;
}

export { HttpError };

export function isHttpError(error: unknown): error is HttpError {
	return error instanceof HttpError;
}

export class RateLimitError extends Error {
	name = "RateLimitError" as const;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
	return error instanceof RateLimitError;
}
