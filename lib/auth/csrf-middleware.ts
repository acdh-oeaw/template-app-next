import { type NextRequest, NextResponse } from "next/server";

export function csrfMiddlware(request: NextRequest): NextResponse {
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

	return NextResponse.next();
}
