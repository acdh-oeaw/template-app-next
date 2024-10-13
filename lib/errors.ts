export class AuthenticationError extends Error {
	name = "AuthenticationError";
}

export class EmailInUseError extends Error {
	name = "EmailInUseError";
}

export class NotFoundError extends Error {
	name = "NotFoundError";
}

export class RateLimitError extends Error {
	name = "RateLimitError";
}

export class SignInError extends Error {
	name = "SignInError";
}
