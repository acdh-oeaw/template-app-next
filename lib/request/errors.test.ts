import { describe, expect, test } from "bun:test";

import { HttpError, isServiceUnavailableError, NetworkError, ParseError, TimeoutError } from "#/lib/request/errors.ts";

const options = { method: "GET", url: "https://example.com" };

function createHttpError(status: number): HttpError {
	return new HttpError({ ...options, body: "", response: new Response(null, { status }) });
}

describe("isServiceUnavailableError", () => {
	test("is true for timeouts, network errors, and gateway statuses", () => {
		expect(isServiceUnavailableError(new TimeoutError(options))).toBe(true);
		expect(isServiceUnavailableError(new NetworkError(options))).toBe(true);
		expect(isServiceUnavailableError(createHttpError(502))).toBe(true);
		expect(isServiceUnavailableError(createHttpError(503))).toBe(true);
		expect(isServiceUnavailableError(createHttpError(504))).toBe(true);
	});

	test("is false for other errors", () => {
		expect(isServiceUnavailableError(createHttpError(500))).toBe(false);
		expect(isServiceUnavailableError(createHttpError(404))).toBe(false);
		expect(isServiceUnavailableError(new ParseError(options))).toBe(false);
		expect(isServiceUnavailableError(new Error("Unexpected"))).toBe(false);
	});
});
