import { log } from "@acdh-oeaw/lib";
import { NextResponse } from "next/server";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/navigation"; // throws!
import { verifyEmail } from "@/lib/users";

export async function GET(request: Request): Promise<Response> {
	try {
		// TODO: ratelimit

		const url = new URL(request.url);
		const code = url.searchParams.get("code");

		if (!code) {
			return NextResponse.redirect(new URL(urls.signIn, request.url));
		}

		await verifyEmail(code);

		return NextResponse.redirect(new URL(urls.afterVerifyEmail, request.url));
	} catch (error) {
		log.error(String(error));

		return NextResponse.redirect(new URL(urls.signIn, request.url));
	}
}
