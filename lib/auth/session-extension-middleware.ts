import { type NextRequest, NextResponse } from "next/server";

import { sessionMaxDurationMs } from "@/config/auth.config";
import { env } from "@/config/env.config";

export function sessionExtensionMiddleware(request: NextRequest): NextResponse {
	/**
	 * Only extend cookie expiration on GET requests since we can be sure
	 * a new session wasn't set when handling the request.
	 */
	if (request.method === "GET") {
		const response = NextResponse.next();

		const token = request.cookies.get("session")?.value;

		if (token != null) {
			response.cookies.set("session", token, {
				path: "/",
				maxAge: sessionMaxDurationMs / 1000,
				sameSite: "lax",
				httpOnly: true,
				secure: env.NODE_ENV === "production",
			});
		}

		return response;
	}

	return NextResponse.next();
}
