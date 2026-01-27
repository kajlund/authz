import { createId } from '@paralleldrive/cuid2';
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('createdAt', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
};

export const userRoleEnum = pgEnum('user_role', ['PROSPECT', 'USER', 'ADMIN']);

export const users = pgTable('Users', {
  id: varchar()
    .primaryKey()
    .$defaultFn(() => createId()),
  alias: varchar({ length: 50 }).notNull().default(''),
  email: varchar({ length: 255 }).notNull().unique(),
  avatar: varchar({ length: 255 })
    .notNull()
    .default('https://placehold.co/200x200'),
  password: text().notNull(),
  role: userRoleEnum().notNull().default('PROSPECT'),
  verified: boolean().default(false),
  refreshToken: text().notNull().default(''),
  forgotToken: text().notNull().default(''),
  forgotExpires: timestamp(),
  verificationToken: text().notNull().default(''),
  verificationExpires: timestamp(),
  ...timestamps,
});
