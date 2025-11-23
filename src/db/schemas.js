import { uuid, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['PROSPECT', 'USER', 'ADMIN']);

export const usersTable = pgTable('Users', {
  id: uuid().primaryKey().defaultRandom(),
  alias: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: userRoleEnum().notNull().default('PROSPECT'),
  password: text().notNull(),
  salt: text().notNull(),
});

export const sessionsTable = pgTable('Sessions', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .references(() => usersTable.id)
    .notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
