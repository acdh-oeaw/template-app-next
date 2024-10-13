"use server";

import { invalidateSession, validateRequest } from "@/lib/auth/session";
import type { ActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";

type SignOutActionState = ActionState;

export async function signOutAction(): Promise<SignOutActionState> {
	const { session } = await validateRequest();

	if (session == null) {
		redirect("/auth/sign-in");
	}

	await invalidateSession(session.id);

	redirect("/auth/sign-in");
}
