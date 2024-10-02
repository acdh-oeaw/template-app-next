import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	username: text("username").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
});

export type User = typeof users.$inferSelect;
export type UserInput = typeof users.$inferInsert;

export const UserSchema = createSelectSchema(users);
export const UserInputSchema = createInsertSchema(users);

//

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(
			() => {
				return users.id;
			},
			{ onDelete: "cascade" },
		),
	expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type SessionInput = typeof sessions.$inferInsert;

export const SessionSchema = createSelectSchema(sessions);
export const SessionInputSchema = createInsertSchema(sessions);
