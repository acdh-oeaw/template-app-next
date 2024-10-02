"use server";

import { cookies } from "next/headers";

import { lucia } from "@/lib/auth/lucia";
import { validateRequest } from "@/lib/auth/validate-request";
import { type ActionState, createErrorActionState } from "@/lib/form";
import { redirect } from "@/lib/navigation";

type SignOutActionState = ActionState;

export async function signOutAction(): Promise<SignOutActionState> {
	const { session } = await validateRequest();

	if (!session) {
		return createErrorActionState("Unauthorized");
	}

	await lucia.invalidateSession(session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

	return redirect("/auth/sign-in");
}
