import { createInsertSchema, createSelectSchema } from "drizzle-valibot";

import { sessions, users } from "@/db/schema";

/**
 * Currently not compatible with `valibot` above v0.30.
 *
 * @see https://github.com/drizzle-team/drizzle-orm/issues/2358
 */

export const UserSchema = createSelectSchema(users);
export const UserInputSchema = createInsertSchema(users);

export const SessionSchema = createSelectSchema(sessions);
export const SessionInputSchema = createInsertSchema(sessions);
