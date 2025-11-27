import { boolean, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

const timestamps = {
  updatedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
};

export const userRoleEnum = pgEnum('user_role', ['PROSPECT', 'USER', 'ADMIN']);

export const usersTable = pgTable('Users', {
  id: uuid().primaryKey().defaultRandom(),
  alias: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  avatar: varchar({ length: 255 }).notNull().default('https://placehold.co/200x200'),
  role: userRoleEnum().notNull().default('PROSPECT'),
  password: text().notNull(),
  salt: text().notNull(),
  verified: boolean().default(false),
  refreshToken: text().notNull().default(''),
  forgotToken: text().notNull().default(''),
  forgotExpires: timestamp().notNull().defaultNow(),
  verificationToken: text().notNull().default(''),
  verificationExpires: timestamp().notNull().defaultNow(),
  ...timestamps,
});

export const sessionsTable = pgTable('Sessions', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .references(() => usersTable.id)
    .notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});
