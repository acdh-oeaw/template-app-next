import { NextResponse } from "next/server";

import type { Middleware } from "@/lib/compose-middlewares";

export const csrfMiddlware: Middleware = function csrfMiddlware(request, response) {
	if (request.method !== "GET") {
		const originHeader = request.headers.get("Origin");
		// TODO: May need to use `X-Forwarded-Host` header.
		const hostHeader = request.headers.get("Host");

		if (originHeader == null || hostHeader == null) {
			return new NextResponse(null, { status: 403 });
		}

		let origin: URL;

		try {
			origin = new URL(originHeader);
		} catch {
			return new NextResponse(null, { status: 403 });
		}

		if (origin.host !== hostHeader) {
			return new NextResponse(null, { status: 403 });
		}
	}

	return response;
};
