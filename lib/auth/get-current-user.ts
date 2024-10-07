import type { User } from "lucia";
import { cache } from "react";

import { validateRequest } from "@/lib/auth/validate-request";

export const getCurrentUser = cache(async function getCurrentUser(): Promise<User | null> {
	const { user } = await validateRequest();

	return user;
});
