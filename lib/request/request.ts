import * as v from "valibot";

import {
	AbortError,
	HttpError,
	NetworkError,
	ParseError,
	TimeoutError,
	ValidationError,
} from "#/lib/request/errors.ts";

export type HttpMethod = "delete" | "get" | "head" | "options" | "patch" | "post" | "put";

interface ResponseTypes {
	bytes: Uint8Array<ArrayBuffer>;
	json: unknown;
	text: string;
	void: undefined;
}

export type ResponseType = keyof ResponseTypes;

/** @see {@link https://github.com/oven-sh/bun/issues/23741#issuecomment-3410060027} */
type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface BaseRequestOptions extends Omit<RequestInit, "body" | "method" | "signal"> {
	/** Mutually exclusive with `json`. */
	body?: BodyInit;
	fetch?: Fetch;
	/** Serialized with `JSON.stringify`, and sent with a json `content-type`. */
	json?: unknown;
	/** @default "get" */
	method?: HttpMethod;
	/**
	 * Retries after network errors, and http 408, 429 and 5xx, for idempotent methods only. Waits with exponential
	 * backoff, or as long as a `retry-after` header asks, if that fits within the `timeout`.
	 *
	 * @default 0
	 */
	retries?: number;
	signal?: AbortSignal;
	/**
	 * Milliseconds for the whole request, including retries and reading the body.
	 *
	 * @default 10_000
	 */
	timeout?: number | false;
}

export interface RequestOptions<
	TResponseType extends ResponseType = ResponseType,
	TSchema extends v.GenericSchema | undefined = undefined,
> extends BaseRequestOptions {
	responseType: TResponseType;
	/** Validates a json response body. */
	schema?: TSchema;
}

export interface RequestResponse<TData> {
	data: TData;
	headers: Headers;
}

type ResponseData<TResponseType extends ResponseType, TSchema> = TResponseType extends "json"
	? TSchema extends v.GenericSchema
		? v.InferOutput<TSchema>
		: unknown
	: ResponseTypes[TResponseType];

const idempotentMethods = new Set(["GET", "HEAD", "OPTIONS"]);

const retryableStatusCodes = new Set([408, 429, 500, 502, 503, 504]);

const errorBodyBytes = 4096;

/**
 * Throws a `RequestError` subclass for errors at runtime, like an unreachable server or an error status. Invalid
 * arguments, like a malformed url, throw as they are, because they are bugs.
 */
export async function request<
	TResponseType extends ResponseType,
	TSchema extends v.GenericSchema | undefined = undefined,
>(
	url: URL | string,
	options: RequestOptions<TResponseType, TSchema>,
): Promise<RequestResponse<ResponseData<TResponseType, TSchema>>> {
	const {
		body: _body,
		fetch = globalThis.fetch,
		headers: _headers,
		json,
		method: _method = "get",
		responseType,
		retries = 0,
		schema,
		signal: callerSignal,
		timeout = 10_000,
		...init
	} = options;

	const method = _method.toUpperCase();
	const href = String(url);
	const headers = new Headers(_headers);

	let body = _body;

	if (json !== undefined) {
		body = JSON.stringify(json);
		if (!headers.has("content-type")) {
			headers.set("content-type", "application/json");
		}
	}

	if (responseType === "json" && !headers.has("accept")) {
		headers.set("accept", "application/json");
	}

	const startedAt = performance.now();
	const deadlineSignal = timeout !== false ? AbortSignal.timeout(timeout) : undefined;
	const signal = AbortSignal.any([callerSignal, deadlineSignal].filter((signal) => signal != null));

	/** A stream can only be sent once. */
	const canRetry = idempotentMethods.has(method) && !(body instanceof ReadableStream);

	function toRequestError(error: unknown) {
		const options = { cause: error, method, url: href };

		if (callerSignal?.aborted === true) {
			return new AbortError({ ...options, cause: callerSignal.reason });
		}

		if (deadlineSignal?.aborted === true || isBunSocketTimeout(error)) {
			return new TimeoutError(options);
		}

		if (isNetworkError(error)) {
			return new NetworkError(options);
		}

		return null;
	}

	for (let attempt = 0; ; attempt++) {
		let failure: HttpError | NetworkError;

		try {
			// oxlint-disable-next-line no-await-in-loop
			const response = await fetch(href, { ...init, body, headers, method, signal });

			if (response.ok) {
				// oxlint-disable-next-line no-await-in-loop
				const data = await readBody(response);
				return { data: data as ResponseData<TResponseType, TSchema>, headers: response.headers };
			}

			// oxlint-disable-next-line no-await-in-loop
			const errorBody = await readStart(response, errorBodyBytes);
			failure = new HttpError({ body: errorBody, method, response, url: href });
		} catch (error) {
			if (error instanceof ParseError || error instanceof ValidationError) {
				throw error;
			}

			const requestError = toRequestError(error);

			if (requestError == null) {
				throw error;
			}

			if (!(requestError instanceof NetworkError)) {
				throw requestError;
			}

			failure = requestError;
		}

		const delay = attempt < retries && canRetry ? getRetryDelay(failure, attempt) : null;
		const remaining = timeout !== false ? timeout - (performance.now() - startedAt) : Infinity;

		if (delay == null || delay >= remaining) {
			throw failure;
		}

		try {
			// oxlint-disable-next-line no-await-in-loop
			await sleep(delay, signal);
		} catch (error) {
			throw toRequestError(error) ?? (error as Error);
		}
	}

	async function readBody(response: Response): Promise<unknown> {
		if (responseType === "void" || method === "HEAD") {
			await discardBody(response);
			return undefined;
		}

		let data: unknown;

		try {
			if (responseType === "bytes") {
				data = await response.bytes();
			} else if (responseType === "text") {
				data = await response.text();
			} else if (response.status === 204) {
				data = undefined;
			} else {
				data = await response.json();
			}
		} catch (error) {
			if (toRequestError(error) != null) {
				throw error;
			}

			throw new ParseError({ cause: error, method, url: href });
		}

		if (schema == null) {
			return data;
		}

		const result = v.safeParse(schema, data);

		if (!result.success) {
			throw new ValidationError({ issues: result.issues, method, url: href });
		}

		return result.output;
	}
}

function getRetryDelay(error: HttpError | NetworkError, attempt: number): number | null {
	if (error instanceof HttpError) {
		if (!retryableStatusCodes.has(error.status)) {
			return null;
		}

		const retryAfter = parseRetryAfter(error.headers.get("retry-after"));

		if (retryAfter != null) {
			return retryAfter;
		}
	}

	/** Up to 30% shorter, so that clients which failed together don't retry together. */
	return 300 * 2 ** attempt * (1 - Math.random() * 0.3);
}

/** Either seconds or an http date. */
function parseRetryAfter(value: string | null): number | null {
	if (value == null) {
		return null;
	}

	if (/^\d+$/.test(value)) {
		return Number(value) * 1000;
	}

	const date = Date.parse(value);

	return Number.isNaN(date) ? null : Math.max(date - Date.now(), 0);
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		signal.throwIfAborted();

		const controller = new AbortController();

		const timer = setTimeout(() => {
			controller.abort();
			resolve();
		}, ms);

		signal.addEventListener(
			"abort",
			() => {
				clearTimeout(timer);
				reject(signal.reason as Error);
			},
			{ once: true, signal: controller.signal },
		);
	});
}

/** Releases an unread body, so that its connection goes back to the pool. */
async function discardBody(response: Response): Promise<void> {
	try {
		await response.body?.cancel();
	} catch {
		/** Already released. */
	}
}

/** Reads up to `bytes` of the body as text, and discards the rest. */
async function readStart(response: Response, bytes: number): Promise<string> {
	if (response.body == null) {
		return "";
	}

	const reader = response.body.getReader();
	const chunks: Array<Uint8Array> = [];
	let length = 0;

	try {
		while (length < bytes) {
			// oxlint-disable-next-line no-await-in-loop
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			chunks.push(value);
			length += value.byteLength;
		}
	} catch {
		/** The start of the body is only informational. */
	} finally {
		await reader.cancel().catch(() => undefined);
	}

	const data = new Uint8Array(Math.min(length, bytes));
	let offset = 0;

	for (const chunk of chunks) {
		const part = chunk.subarray(0, data.length - offset);
		data.set(part, offset);
		offset += part.length;
	}

	return new TextDecoder().decode(data);
}

function isTypeError(error: unknown): error is TypeError {
	return Error.isError(error) && error.name === "TypeError";
}

/** Bun rejects with a `TypeError` with code `Timeout` when its socket idle timeout fires. */
function isBunSocketTimeout(error: unknown): boolean {
	return isTypeError(error) && "code" in error && error.code === "Timeout";
}

/** Bun sets these codes on the `TypeError`, Node.js on its `cause`, which is matched by message. */
const networkErrorCodes = new Set([
	"ConnectionRefused",
	"ECONNRESET",
	"ENOTFOUND",
	"EPIPE",
	"ETIMEOUT",
	"FailedToOpenSocket",
]);

const networkErrorMessages = new Set([
	"Failed to fetch",
	"fetch failed",
	"Network connection lost",
	"network error",
	"Network request failed",
	"NetworkError when attempting to fetch resource.",
	"terminated",
	"The Internet connection appears to be offline.",
]);

/**
 * Fetch rejects with a `TypeError` for network errors, but also for invalid requests, so match known codes and
 * messages. Messages adapted from `is-network-error` (MIT).
 *
 * @see {@link https://github.com/sindresorhus/is-network-error}
 */
function isNetworkError(error: unknown): boolean {
	if (!isTypeError(error)) {
		return false;
	}

	if ("code" in error && typeof error.code === "string" && networkErrorCodes.has(error.code)) {
		return true;
	}

	/** Safari also uses this message for other errors, which have a stack. */
	if (error.message === "Load failed") {
		return error.stack === undefined;
	}

	return networkErrorMessages.has(error.message) || error.message.startsWith("error sending request for url");
}
