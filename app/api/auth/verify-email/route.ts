import { log } from "@acdh-oeaw/lib";

import { urls } from "@/config/auth.config";
import { verifyEmail } from "@/lib/users";

export async function GET(request: Request): Promise<Response> {
	try {
		// TODO: ratelimit

		const url = new URL(request.url);
		const code = url.searchParams.get("code");

		if (!code) {
			return new Response(null, {
				status: 302,
				headers: {
					Location: urls.signIn,
				},
			});
		}

		await verifyEmail(code);

		return new Response(null, {
			status: 302,
			headers: {
				Location: urls.afterVerifyEmail,
			},
		});
	} catch (error) {
		log.error(String(error));

		return new Response(null, {
			status: 302,
			headers: {
				Location: urls.signIn,
			},
		});
	}
}
