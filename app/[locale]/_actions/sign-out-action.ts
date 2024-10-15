"use server";

import { urls } from "@/config/auth.config";
import { deleteSessionTokenCookie } from "@/lib/auth/cookies";
import { getCurrentSession, invalidateSession } from "@/lib/auth/sessions";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";
import { globalPOSTRateLimit } from "@/lib/rate-limit";

type SignOutActionState = ActionState;

export async function signOutAction(
	_previousState: SignOutActionState,
): Promise<SignOutActionState> {
	if (!globalPOSTRateLimit()) {
		return createErrorActionState("Too many requests");
	}

	const { session } = await getCurrentSession();

	if (session == null) {
		redirect(urls.signIn);
	}

	await invalidateSession(session.id);
	await deleteSessionTokenCookie();

	redirect(urls.signIn);
}
