import { eq } from "drizzle-orm";

import { db } from "@/db";
import { sessions } from "@/db/schema";

export async function deleteSessionsByUser(userId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}
