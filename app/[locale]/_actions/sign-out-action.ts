"use server";

import { urls } from "@/config/auth.config";
import { deleteSessionTokenCookie } from "@/lib/auth/cookies";
import { invalidateSession, validateRequest } from "@/lib/auth/sessions";
import type { ActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";

type SignOutActionState = ActionState;

export async function signOutAction(): Promise<SignOutActionState> {
	const { session } = await validateRequest();

	if (session == null) {
		redirect(urls.signIn);
	}

	await invalidateSession(session.id);
	deleteSessionTokenCookie();

	redirect(urls.signIn);
}
