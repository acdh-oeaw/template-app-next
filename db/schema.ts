import { relations, sql } from "drizzle-orm";
import {
	index,
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

/** User roles. */

export const userRole = createEnum("user_roles", ["admin", "user"]);

/** Users. */

export const users = createTable(
	"users",
	{
		id,
		email: text().notNull().unique(),
		// emailVerified: timestamp({ mode: "date", withTimezone: true }).notNull().default(new Date(0)),
		username: text().notNull(),
		passwordHash: text().notNull(),
		role: userRole().notNull().default("user"),
		// totpKey: blob(),
		// recoveryCode: blob().notNull(),
		...timestamps,
	},
	(table) => {
		return {
			emailIdx: index().on(table.email),
		};
	},
);

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
	// twoFactorVerified: timestamp({ mode: "date", withTimezone: true }).notNull().default(new Date(0)),
});

export const sessionRelations = relations(sessions, ({ one }) => {
	return {
		user: one(users, { fields: [sessions.userId], references: [users.id] }),
	};
});

export type Session = typeof sessions.$inferSelect;
export type SessionInput = typeof sessions.$inferInsert;

/** Email verification requests. */

export const emailVerificationRequests = createTable("email_verification_requests", {
	id,
	userId: uuid()
		.notNull()
		.references(
			() => {
				return users.id;
			},
			{ onDelete: "cascade" },
		),
	email: text().notNull(),
	code: text().notNull(),
	expiresAt: timestamp({ mode: "date", withTimezone: true }).notNull(),
});

export const emailVerificationRequestRelations = relations(emailVerificationRequests, ({ one }) => {
	return {
		user: one(users, { fields: [emailVerificationRequests.userId], references: [users.id] }),
	};
});

export type EmailVerificationRequest = typeof emailVerificationRequests.$inferSelect;
export type EmailVerificationRequestInput = typeof emailVerificationRequests.$inferInsert;

/** Password reset sessions. */

export const passwordResetSessions = createTable("password_reset_sessions", {
	id,
	userId: uuid()
		.notNull()
		.references(
			() => {
				return users.id;
			},
			{ onDelete: "cascade" },
		),
	email: text().notNull(),
	code: text().notNull(),
	expiresAt: timestamp({ mode: "date", withTimezone: true }).notNull(),
	emailVerified: timestamp({ mode: "date", withTimezone: true }).notNull().default(new Date(0)),
	twoFactorVerified: timestamp({ mode: "date", withTimezone: true }).notNull().default(new Date(0)),
});

export const passwordResetSessionRelations = relations(passwordResetSessions, ({ one }) => {
	return {
		user: one(users, { fields: [passwordResetSessions.userId], references: [users.id] }),
	};
});

export type PasswordResetSession = typeof passwordResetSessions.$inferSelect;
export type PasswordResetSessionInput = typeof passwordResetSessions.$inferInsert;
