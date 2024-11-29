"use server";

import { getTranslations } from "next-intl/server";

import {
	type ActionState,
	createErrorActionState,
	createSuccessActionState,
} from "@/lib/server/actions";
import { getCurrentSession } from "@/lib/server/auth/sessions";
import { resetUserRecoveryCode } from "@/lib/server/auth/users";
import { globalPostRateLimit } from "@/lib/server/rate-limit/global-rate-limit";

export async function regenerateRecoveryCodeAction(): Promise<ActionState> {
	const e = await getTranslations("errors");

	if (!(await globalPostRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests"), formData: null });
	}

	const { session, user } = await getCurrentSession();

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (session == null || user == null) {
		return createErrorActionState({ message: e("not-authenticated"), formData: null });
	}
	if (!user.emailVerified) {
		return createErrorActionState({ message: e("forbidden"), formData: null });
	}
	if (!session.twoFactorVerified) {
		return createErrorActionState({ message: e("forbidden"), formData: null });
	}

	const recoveryCode = await resetUserRecoveryCode(session.userId);
	const formData = new FormData();
	formData.set("recovery-code", recoveryCode);

	return createSuccessActionState({ message: null, formData });
}
