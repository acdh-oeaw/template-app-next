import "server-only";

import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";

import { db } from "@/db";
import { sessions, type User, users } from "@/db/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	getUserAttributes(attributes) {
		return {
			email: attributes.email,
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
		expires: false,
	},
});

declare module "lucia" {
	interface Register {
		DatabaseUserAttributes: Omit<User, "id">;
		Lucia: typeof lucia;
	}
}
