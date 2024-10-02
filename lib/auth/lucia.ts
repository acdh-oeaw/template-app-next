import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";

import { db } from "@/lib/db";
import { sessionTable, userTable } from "@/lib/db/schema";

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
	getUserAttributes(attributes) {
		return {
			username: attributes.username,
		};
	},
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production",
		},
		/**
		 * This sets cookies with super long expiration since next.js doesn't allow extending
		 * cookie expiration when rendering pages.
		 */
		// expires: false,
	},
});

declare module "lucia" {
	interface Register {
		DatabaseUserAttributes: Omit<DatabaseUser, "id">;
		Lucia: typeof lucia;
	}
}
