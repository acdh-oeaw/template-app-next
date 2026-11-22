import type * as v from "valibot";

interface RequestErrorOptions {
	cause?: unknown;
	method: string;
	url: string;
}

/** Leaves out search params, which can contain secrets, like api keys. */
function formatUrl(url: string): string {
	const { origin, pathname } = new URL(url);
	return `${origin}${pathname}`;
}

export abstract class RequestError extends Error {
	abstract override readonly name: string;
	readonly method: string;
	readonly url: string;

	constructor(message: string, options: RequestErrorOptions) {
		super(`${message} - ${options.method} ${formatUrl(options.url)}`, { cause: options.cause });
		this.method = options.method;
		this.url = options.url;
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
