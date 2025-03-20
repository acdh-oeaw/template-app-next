export class HoneypotError extends Error {
	name = "HoneypotError" as const;
}

export class RateLimitError extends Error {
	name = "RateLimitError" as const;
}
