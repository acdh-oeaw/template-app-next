import type { User } from "lucia";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AuthenticationError } from "@/lib/errors";

export async function assertAuthenticatedUser(): Promise<User> {
	const user = await getCurrentUser();

	if (user == null) {
		throw new AuthenticationError();
	}

	return user;
}
