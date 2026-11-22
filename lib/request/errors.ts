import type * as v from "valibot";

interface RequestErrorOptions {
	cause?: unknown;
	method: string;
	url: string;
}

/** Removes credentials in the url, like `https://user:password@example.com`, which would end up in logs. */
function redactUrl(url: string): string {
	let parsed: URL;

	try {
		parsed = new URL(url);
	} catch {
		/** Relative urls have no credentials. */
		return url;
	}

	if (parsed.username === "" && parsed.password === "") {
		return url;
	}

	parsed.username = "";
	parsed.password = "";

	return parsed.href;
}

export abstract class RequestError extends Error {
	abstract override readonly name: string;
	readonly method: string;
	/** Without credentials. */
	readonly url: string;

	constructor(message: string, options: RequestErrorOptions) {
		const url = redactUrl(options.url);
		super(`${message} - ${options.method} ${url}`, { cause: options.cause });
		this.method = options.method;
		this.url = url;
	}
}

/** The caller's `signal` aborted. */
export class AbortError extends RequestError {
	override readonly name = "AbortError";

	constructor(options: RequestErrorOptions) {
		super("Request aborted", options);
	}
}

/** The request did not finish within its `timeout`, including retries. */
export class TimeoutError extends RequestError {
	override readonly name = "TimeoutError";

	constructor(options: RequestErrorOptions) {
		super("Request timed out", options);
	}
}

/** The server could not be reached, or the connection dropped. */
export class NetworkError extends RequestError {
	override readonly name = "NetworkError";

	constructor(options: RequestErrorOptions) {
		super("Network error", options);
	}
}

/** The response has an error status. `body` holds the start of the response body, the rest is discarded. */
export class HttpError extends RequestError {
	override readonly name = "HttpError";
	readonly status: number;
	readonly headers: Headers;
	readonly body: string;

	constructor(options: RequestErrorOptions & { body: string; response: Response }) {
		const { body, response } = options;
		super(`${String(response.status)} ${response.statusText}`, options);
		this.status = response.status;
		this.headers = response.headers;
		this.body = body;
	}
}

/** The response body is not valid, like malformed json. */
export class ParseError extends RequestError {
	override readonly name = "ParseError";

	constructor(options: RequestErrorOptions) {
		super("Invalid response body", options);
	}
}

/** The response body does not match the `schema`. */
export class ValidationError extends RequestError {
	override readonly name = "ValidationError";
	readonly issues: [v.BaseIssue<unknown>, ...Array<v.BaseIssue<unknown>>];

	constructor(options: RequestErrorOptions & { issues: [v.BaseIssue<unknown>, ...Array<v.BaseIssue<unknown>>] }) {
		super("Unexpected response body", options);
		this.issues = options.issues;
	}
}

/** Gateway statuses, which mean that a service behind the server is not available. */
const serviceUnavailableStatuses = new Set([502, 503, 504]);

/** The service could not be reached or did not respond in time, so retrying later may succeed. */
export function isServiceUnavailableError(error: unknown): boolean {
	return (
		error instanceof TimeoutError ||
		error instanceof NetworkError ||
		(error instanceof HttpError && serviceUnavailableStatuses.has(error.status))
	);
}
