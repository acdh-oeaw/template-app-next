import { assert } from "@acdh-oeaw/lib";

import type { User } from "@/db/schema";
import { createHashedPassword, verifyPassword } from "@/lib/auth/password";
import { createUser, getUserByEmail } from "@/lib/data-access/users";
import { EmailInUseError, SignInError } from "@/lib/errors";

export async function signInUser(email: string, password: string): Promise<User> {
	const user = await getUserByEmail(email);

	if (user == null) {
		throw new SignInError();
	}

	const isValidPassword = await verifyPassword(user.passwordHash, password);

	if (!isValidPassword) {
		throw new SignInError();
	}

	return user;
}

export async function signUpUser(email: string, password: string) {
	const existingUser = await getUserByEmail(email);

	if (existingUser != null) {
		throw new EmailInUseError();
	}

	const passwordHash = await createHashedPassword(password);

	const user = await createUser(email, passwordHash);

	assert(user);

	return user;
}
