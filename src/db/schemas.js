import { createId } from '@paralleldrive/cuid2';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  alias: text().notNull().default(''),
  email: text().notNull().unique(),
  avatar: text()
    .notNull()
    .default('https://placehold.co/200x200'),
  password: text().notNull(),
  role: text().notNull().default('PROSPECT'),
  verified: int({ mode: 'boolean' }).default(0),
  refreshToken: text().notNull().default(''),
  forgotToken: text().notNull().default(''),
  forgotExpires: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  verificationToken: text().notNull().default(''),
  verificationExpires: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  createdAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});
