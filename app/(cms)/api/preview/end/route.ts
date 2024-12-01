import { cookies, draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { rewriteUrl } from "@/lib/keystatic/rewrite-url";

export async function POST(_request: NextRequest): Promise<NextResponse> {
	const request = rewriteUrl(_request);

	if (request.headers.get("origin") !== new URL(request.url).origin) {
		return new NextResponse("Invalid origin", { status: 400 });
	}

	const referrer = request.headers.get("Referer");
	if (!referrer) {
		return new NextResponse("Missing referer", { status: 400 });
	}

	(await draftMode()).disable();
	(await cookies()).delete("ks-branch");

	return NextResponse.redirect(referrer, 303);
}
