"use server";

import { getLocale, getTranslations } from "next-intl/server";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { deleteSessionTokenCookie } from "@/lib/server/auth/session-cookies";
import { getCurrentSession, invalidateSession } from "@/lib/server/auth/sessions";
import { globalPostRateLimit } from "@/lib/server/rate-limit/global-rate-limit";

export async function signOutAction(): Promise<ActionState> {
	const locale = await getLocale();
	const e = await getTranslations("errors");

	if (!(await globalPostRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const { session } = await getCurrentSession();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}

	await invalidateSession(session.id);
	await deleteSessionTokenCookie();

	redirect({ href: urls.signIn, locale });
}
