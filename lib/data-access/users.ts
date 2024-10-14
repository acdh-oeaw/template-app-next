import { eq } from "drizzle-orm";

import { db } from "@/db";
import { type User, users } from "@/db/schema";

export async function createUser(email: string, passwordHash: string) {
	const [user] = await db
		.insert(users)
		.values({
			email,
			passwordHash,
		})
		.returning();

	return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
	const user = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	return user;
}

export async function setUserEmailVerified(userId: string): Promise<void> {
	await db
		.update(users)
		.set({
			emailVerified: new Date(),
		})
		.where(eq(users.id, userId));
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
	await db
		.update(users)
		.set({
			passwordHash,
		})
		.where(eq(users.id, userId));
}
