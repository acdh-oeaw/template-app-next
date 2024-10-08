import { relations, sql } from "drizzle-orm";
import {
	pgEnum as createEnum,
	pgTable as createTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

const id = uuid().primaryKey().defaultRandom();

const timestamps = {
	createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ mode: "date", withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => {
			return sql`CURRENT_TIMESTAMP`;
		}),
};

/** User role. */

export const userRole = createEnum("user_roles", ["admin", "user"]);

/** Users. */

export const users = createTable("users", {
	id,
	email: text().notNull().unique(),
	passwordHash: text().notNull(),
	role: userRole().default("user"),
	...timestamps,
});

export const userRelations = relations(users, ({ many }) => {
	return {
		sessions: many(sessions),
	};
});

export type User = typeof users.$inferSelect;
export type UserInput = typeof users.$inferInsert;

/** Sessions. */

export const sessions = createTable("sessions", {
	id: text().primaryKey(),
	userId: uuid()
		.notNull()
		.references(
			() => {
				return users.id;
			},
			{ onDelete: "cascade" },
		),
	expiresAt: timestamp({ mode: "date", withTimezone: true }).notNull(),
});

export const sessionRelations = relations(sessions, ({ one }) => {
	return {
		user: one(users, { fields: [sessions.userId], references: [users.id] }),
	};
});

export type Session = typeof sessions.$inferSelect;
export type SessionInput = typeof sessions.$inferInsert;
