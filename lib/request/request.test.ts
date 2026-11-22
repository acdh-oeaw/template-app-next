import { describe, expect, test } from "bun:test";

import * as v from "valibot";

import {
	AbortError,
	HttpError,
	NetworkError,
	ParseError,
	TimeoutError,
	ValidationError,
} from "#/lib/request/errors.ts";
import { request } from "#/lib/request/request.ts";

const url = "https://example.com/api?page=2";

type Handler = (request: Request) => Response;

/** Records each request, and responds with the next handler, or the last one. */
function createFetch(...handlers: Array<Handler>) {
	const requests: Array<Request> = [];

	// oxlint-disable-next-line require-await -- handlers throw to reject
	async function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		const request = new Request(input, init);
		requests.push(request);
		const handler = handlers[Math.min(requests.length, handlers.length) - 1]!;
		return handler(request);
	}

	return { fetch, requests };
}

/** Returns what the promise rejects with. */
async function getError(promise: Promise<unknown>): Promise<unknown> {
	try {
		await promise;
	} catch (error) {
		return error;
	}

	throw new Error("Expected the promise to reject.");
}

/** A response whose body stays open after `text`, and records whether it was cancelled. */
function createResponse(text: string, init?: ResponseInit) {
	const state = { isCancelled: false };

	const body = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(new TextEncoder().encode(text));
		},
		cancel() {
			state.isCancelled = true;
		},
	});

	return { response: new Response(body, init), state };
}

function throwError(error: Error): never {
	throw error;
}

describe("request", () => {
	test("returns json data and headers", async () => {
		const { fetch } = createFetch(() => Response.json({ id: 1 }, { headers: { "x-total": "1" } }));

		const response = await request(url, { fetch, responseType: "json" });

		expect(response.data).toStrictEqual({ id: 1 });
		expect(response.headers.get("x-total")).toBe("1");
	});

	test("validates json data with a schema", async () => {
		const { fetch } = createFetch(() => Response.json({ id: "1" }));
		const schema = v.object({ id: v.pipe(v.string(), v.transform(Number)) });

		const response = await request(url, { fetch, responseType: "json", schema });
		const id: number = response.data.id;

		expect(id).toBe(1);
	});

	test("only accepts a schema for json", async () => {
		const { fetch } = createFetch(() => new Response("1"));
		const schema = v.pipe(v.string(), v.transform(Number));

		// @ts-expect-error -- the schema would not apply
		const response = await request(url, { fetch, responseType: "text", schema });

		expect(response.data).toBe("1");
	});

	test("throws a ValidationError for data that does not match the schema", async () => {
		const { fetch } = createFetch(() => Response.json({ id: 1 }));
		const schema = v.object({ id: v.string() });

		const promise = request(url, { fetch, responseType: "json", schema });

		const error = await getError(promise);

		expect(error).toBeInstanceOf(ValidationError);
	});

	test("throws a ParseError for malformed json", async () => {
		const { fetch } = createFetch(() => new Response("{"));

		const error = await getError(request(url, { fetch, responseType: "json" }));

		expect(error).toBeInstanceOf(ParseError);
	});

	test("returns undefined for an empty json body", async () => {
		const { fetch } = createFetch(
			() => new Response(null, { status: 204 }),
			() => new Response(""),
		);

		const responses = [
			await request(url, { fetch, responseType: "json" }),
			await request(url, { fetch, responseType: "json" }),
		];

		expect(responses.map((response) => response.data)).toStrictEqual([undefined, undefined]);
	});

	test("does not accept both body and json", async () => {
		const { fetch, requests } = createFetch(() => new Response());

		// @ts-expect-error -- only one of them can be sent
		await request(url, { body: "body", fetch, json: {}, method: "post", responseType: "void" });

		expect(requests).toHaveLength(1);
	});

	test("sends a json body", async () => {
		const { fetch, requests } = createFetch(() => new Response());

		await request(url, { fetch, json: { id: 1 }, method: "post", responseType: "void" });

		const body = await requests[0]!.text();

		expect(requests[0]!.headers.get("content-type")).toBe("application/json");
		expect(body).toBe('{"id":1}');
	});

	test("only sets an accept header for json", async () => {
		const { fetch, requests } = createFetch(() => new Response("{}"));

		await request(url, { fetch, responseType: "json" });
		await request(url, { fetch, responseType: "text" });

		expect(requests.map((request) => request.headers.get("accept"))).toStrictEqual(["application/json", null]);
	});

	test("discards the body for responseType void", async () => {
		const { response, state } = createResponse("ignored");
		const { fetch } = createFetch(() => response);

		await request(url, { fetch, responseType: "void" });

		expect(state.isCancelled).toBe(true);
	});
});

describe("request errors", () => {
	test("throws an HttpError with the start of the body, and discards the rest", async () => {
		const { response, state } = createResponse("x".repeat(10_000), { status: 404, statusText: "Not Found" });
		const { fetch } = createFetch(() => response);

		const error = (await getError(request(url, { fetch, responseType: "text" }))) as HttpError;

		expect(error).toBeInstanceOf(HttpError);
		expect(error.status).toBe(404);
		expect(error.body).toHaveLength(4096);
		expect(state.isCancelled).toBe(true);
	});

	test("includes the method and url in the message", async () => {
		const { fetch } = createFetch(() => new Response(null, { status: 500, statusText: "Internal Server Error" }));

		const promise = request(url, { fetch, responseType: "void" });

		const error = await getError(promise);

		expect(error).toHaveProperty("message", "500 Internal Server Error - GET https://example.com/api?page=2");
	});

	test("throws a TimeoutError when the timeout fires while reading the body", async () => {
		const { fetch } = createFetch((request) => {
			const body = new ReadableStream({
				start(controller) {
					request.signal.addEventListener("abort", () => {
						controller.error(request.signal.reason);
					});
				},
			});
			return new Response(body);
		});

		const error = await getError(request(url, { fetch, responseType: "text", timeout: 10 }));

		expect(error).toBeInstanceOf(TimeoutError);
	});

	test("throws a TimeoutError when the timeout fires while reading an error body", async () => {
		const { fetch } = createFetch((request) => {
			const body = new ReadableStream({
				start(controller) {
					request.signal.addEventListener("abort", () => {
						controller.error(request.signal.reason);
					});
				},
			});
			return new Response(body, { status: 503 });
		});

		const error = await getError(request(url, { fetch, responseType: "void", timeout: 10 }));

		expect(error).toBeInstanceOf(TimeoutError);
	});

	test("throws a NetworkError for a cross-realm TypeError", async () => {
		const { runInNewContext } = await import("node:vm");
		const cause = runInNewContext('new TypeError("fetch failed")') as Error;
		const { fetch } = createFetch(() => throwError(cause));

		const error = await getError(request(url, { fetch, responseType: "void" }));

		expect(cause).not.toBeInstanceOf(TypeError);
		expect(error).toBeInstanceOf(NetworkError);
	});

	test("throws an AbortError when the caller aborts", async () => {
		const controller = new AbortController();
		controller.abort();

		const promise = request(url, { responseType: "void", signal: controller.signal });

		const error = await getError(promise);

		expect(error).toBeInstanceOf(AbortError);
	});

	test.each([
		"EAI_AGAIN",
		"ECONNABORTED",
		"ECONNREFUSED",
		"ECONNRESET",
		"EHOSTUNREACH",
		"ENETUNREACH",
		"ENOTFOUND",
		"EPIPE",
		"ETIMEDOUT",
	])("throws a NetworkError for Bun's %s error", async (code) => {
		const { fetch } = createFetch(() => throwError(Object.assign(new TypeError("Connection failed"), { code })));

		const error = await getError(request(url, { fetch, responseType: "void" }));

		expect(error).toBeInstanceOf(NetworkError);
	});

	test("throws a NetworkError when Bun's fetch cannot connect", async () => {
		// oxlint-disable-next-line no-empty-function -- Bun requires a data handler
		const listener = Bun.listen({ hostname: "127.0.0.1", port: 0, socket: { data() {} } });
		const { port } = listener;
		listener.stop(true);

		const error = await getError(request(`http://127.0.0.1:${String(port)}/`, { responseType: "void" }));

		expect(error).toBeInstanceOf(NetworkError);
	});

	test("throws a NetworkError when Bun's fetch loses the connection", async () => {
		const listener = Bun.listen({
			hostname: "127.0.0.1",
			port: 0,
			socket: {
				// oxlint-disable-next-line no-empty-function -- Bun requires a data handler
				data() {},
				open(socket) {
					socket.terminate();
				},
			},
		});

		try {
			const error = await getError(request(`http://127.0.0.1:${String(listener.port)}/`, { responseType: "void" }));

			expect(error).toBeInstanceOf(NetworkError);
		} finally {
			listener.stop(true);
		}
	});

	test("throws a TimeoutError for Bun's socket timeout", async () => {
		const { fetch } = createFetch(() =>
			throwError(Object.assign(new TypeError("The operation timed out."), { code: "Timeout" })),
		);

		const error = await getError(request(url, { fetch, responseType: "void" }));

		expect(error).toBeInstanceOf(TimeoutError);
	});

	test.each(["Failed to fetch", "fetch failed", "NetworkError when attempting to fetch resource."])(
		"throws a NetworkError for the %s message",
		async (message) => {
			const { fetch } = createFetch(() => throwError(new TypeError(message)));

			const error = await getError(request(url, { fetch, responseType: "void" }));

			expect(error).toBeInstanceOf(NetworkError);
		},
	);

	test("rethrows other errors as they are", async () => {
		const cause = new TypeError("Invalid request");
		const { fetch } = createFetch(() => throwError(cause));

		const error = await getError(request(url, { fetch, responseType: "void" }));

		expect(error).toBe(cause);
	});

	test("throws invalid urls as they are", async () => {
		const error = await getError(request("not a url", { responseType: "void" }));

		expect(error).toBeInstanceOf(TypeError);
	});
});

describe("request retries", () => {
	test.each([
		{ status: 400, calls: 1 },
		{ status: 404, calls: 1 },
		{ status: 408, calls: 3 },
		{ status: 429, calls: 3 },
		{ status: 503, calls: 3 },
	])("retries http $status $calls time(s)", async ({ status, calls }) => {
		const { fetch, requests } = createFetch(() => new Response(null, { status, headers: { "retry-after": "0" } }));

		await request(url, { fetch, responseType: "void", retries: 2 }).catch(() => null);

		expect(requests).toHaveLength(calls);
	});

	test("returns the response of a successful retry", async () => {
		const { fetch } = createFetch(
			() => new Response(null, { status: 503, headers: { "retry-after": "0" } }),
			() => new Response("ok"),
		);

		const response = await request(url, { fetch, responseType: "text", retries: 1 });

		expect(response.data).toBe("ok");
	});

	test("retries network errors", async () => {
		const { fetch } = createFetch(
			() => throwError(new TypeError("fetch failed")),
			() => new Response("ok"),
		);

		const response = await request(url, { fetch, responseType: "text", retries: 1 });

		expect(response.data).toBe("ok");
	});

	test("does not retry methods that are not safe", async () => {
		const { fetch, requests } = createFetch(() => new Response(null, { status: 503, headers: { "retry-after": "0" } }));

		await request(url, { fetch, method: "post", responseType: "void", retries: 2 }).catch(() => null);

		expect(requests).toHaveLength(1);
	});

	test("discards the body of each failed attempt", async () => {
		const states: Array<{ isCancelled: boolean }> = [];
		const { fetch } = createFetch(() => {
			const { response, state } = createResponse("x".repeat(10_000), { status: 503, headers: { "retry-after": "0" } });
			states.push(state);
			return response;
		});

		await request(url, { fetch, responseType: "void", retries: 1 }).catch(() => null);

		expect(states).toStrictEqual([{ isCancelled: true }, { isCancelled: true }]);
	});

	test("does not retry when retry-after exceeds the remaining timeout", async () => {
		const { fetch, requests } = createFetch(
			() => new Response(null, { status: 503, headers: { "retry-after": "60" } }),
		);

		const error = await getError(request(url, { fetch, responseType: "void", retries: 2 }));

		expect(error).toBeInstanceOf(HttpError);

		expect(requests).toHaveLength(1);
	});

	test("does not retry when retry-after exceeds a minute, also without a timeout", async () => {
		const { fetch, requests } = createFetch(
			() => new Response(null, { status: 503, headers: { "retry-after": "2592000" } }),
		);

		const error = await getError(request(url, { fetch, responseType: "void", retries: 1, timeout: false }));

		expect(error).toBeInstanceOf(HttpError);

		expect(requests).toHaveLength(1);
	});

	test("throws an AbortError when the caller aborts while waiting for a retry", async () => {
		const { fetch } = createFetch(() => new Response(null, { status: 503, headers: { "retry-after": "5" } }));

		const promise = request(url, { fetch, responseType: "void", retries: 1, signal: AbortSignal.timeout(50) });

		const error = await getError(promise);

		expect(error).toBeInstanceOf(AbortError);
	});
});
