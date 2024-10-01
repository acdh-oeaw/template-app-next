"use server";

import { cookies } from "next/headers";

import { auth, validateRequest } from "@/lib/auth";
import type { ActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";

type SignOutActionState = ActionState;

export async function signOutAction(): Promise<SignOutActionState> {
	const { session } = await validateRequest();

	if (!session) {
		return {
			status: "error",
			message: "Unauthorized",
			timestamp: Date.now(),
		};
	}

	await auth.invalidateSession(session.id);

	const sessionCookie = auth.createBlankSessionCookie();
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

	return redirect("/auth/sign-in");
}
