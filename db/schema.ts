import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	username: text("username").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => {
			return sql`CURRENT_TIMESTAMP`;
		}),
});

export const userRelations = relations(users, ({ many }) => {
	return {
		sessions: many(sessions, { relationName: "sessions" }),
	};
});

export type User = typeof users.$inferSelect;
export type UserInput = typeof users.$inferInsert;

//

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(
			() => {
				return users.id;
			},
			{ onDelete: "cascade" },
		),
	expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
});

export const sessionRelations = relations(sessions, ({ one }) => {
	return {
		user: one(users, { relationName: "user", fields: [sessions.userId], references: [users.id] }),
	};
});

export type Session = typeof sessions.$inferSelect;
export type SessionInput = typeof sessions.$inferInsert;
