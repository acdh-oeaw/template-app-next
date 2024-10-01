import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { Lucia, type Session, type User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";

import { type DatabaseUser, db } from "@/lib/db";

const adapter = new BetterSqlite3Adapter(db, {
	user: "user",
	session: "session",
});

export const auth = new Lucia(adapter, {
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

export const validateRequest = cache(async function validateRequest(): Promise<
	{ user: User; session: Session } | { user: null; session: null }
> {
	const sessionId = cookies().get(auth.sessionCookieName)?.value ?? null;

	if (!sessionId) {
		return { user: null, session: null };
	}

	const result = await auth.validateSession(sessionId);

	/** Next.js throws when you attempt to set cookie when rendering page. */
	try {
		if (result.session?.fresh) {
			const sessionCookie = auth.createSessionCookie(result.session.id);
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
		if (!result.session) {
			const sessionCookie = auth.createBlankSessionCookie();
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
	} catch {
		/** noop */
	}

	return result;
});

declare module "lucia" {
	interface Register {
		DatabaseUserAttributes: Omit<DatabaseUser, "id">;
		Lucia: typeof auth;
	}
}
