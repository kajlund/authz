import { eq } from 'drizzle-orm';

import db from './index.js';
import { usersTable } from './schemas.js';

export function getUserDAO(log) {
  return {
    addUser: async function (data) {
      const time = new Date();
      data.createdAt = time;
      data.updatedAt = time;
      const [newUser] = await db.insert(usersTable).values(data).returning();
      log.debug(newUser, 'Created user');
      return newUser;
    },
    findUserByEmail: async function (email) {
      const [found] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      log.debug(found, `Found user by email ${email}`);
      return found;
    },
    findUserById: async function (id) {
      const [found] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
      log.debug(found, `Found user by id ${id}`);
      return found;
    },
    findByForgotToken: async function (token) {
      const [found] = await db.select().from(usersTable).where(eq(usersTable.forgotToken, token)).limit(1);
      log.debug(found, `Found user by forgot password token ${token}`);
      return found;
    },
    findByVerificationToken: async function (token) {
      const [found] = await db.select().from(usersTable).where(eq(usersTable.verificationToken, token)).limit(1);
      log.debug(found, `Found user by verification token ${token}`);
      return found;
    },
    queryUsers: async function () {
      const users = await db
        .select({ id: usersTable.id, alias: usersTable.alias, email: usersTable.email, role: usersTable.role })
        .from(usersTable);
      log.debug(users, 'Found users');
      return users;
    },
    updateUser: async function (id, data) {
      data.updatedAt = new Date();
      const [updated] = await db.update(usersTable).set(data).where(eq(usersTable.id, id)).returning();
      log.debug(updated, `Updated user by id ${id}`);
      return updated;
    },
  };
}
