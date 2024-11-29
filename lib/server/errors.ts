export class DatabaseError extends Error {
	name = "DatabaseError";
}

export class ForbiddenError extends Error {
	name = "ForbiddenError";
}

export class NotFoundError extends Error {
	name = "NotFoundError";
}

export class RateLimitError extends Error {
	name = "RateLimit";
}

export class UnauthorizedError extends Error {
	name = "UnauthorizedError";
}
