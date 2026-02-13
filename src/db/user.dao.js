import { eq } from 'drizzle-orm';
import gravatar from 'gravatar';

import db from './index.js';
import { users } from './schemas.js';

export function getUserDAO(log) {
  return {
    createUser: async function (data) {
      const time = new Date();
      data.createdAt = time.toISOString();
      data.updatedAt = time.toISOString();
      data.avatar = gravatar.url(data.email);
      const [newUser] = await db.insert(users).values(data).returning();
      log.debug(newUser, 'Created user');
      return newUser;
    },
    deleteUser: async function (id) {
      const [deleted] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();
      log.debug(deleted, `Deleted activity by id ${id}`);
      return deleted;
    },
    findUserByEmail: async function (email) {
      const [found] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      log.debug(found, `Found user by email ${email}`);
      return found;
    },
    findUserById: async function (id) {
      const [found] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      log.debug(found, `Found user by id ${id}`);
      return found;
    },
    findByForgotToken: async function (token) {
      const [found] = await db
        .select()
        .from(users)
        .where(eq(users.forgotToken, token))
        .limit(1);
      log.debug(found, `Found user by forgot password token ${token}`);
      return found;
    },
    findByVerificationToken: async function (token) {
      const [found] = await db
        .select()
        .from(users)
        .where(eq(users.verificationToken, token))
        .limit(1);
      log.debug(found, `Found user by verification token ${token}`);
      return found;
    },
    queryUsers: async function () {
      const data = await db
        .select({
          id: users.id,
          alias: users.alias,
          email: users.email,
          role: users.role,
        })
        .from(users);
      log.debug(data, 'Found users');
      return data;
    },
    updateUser: async function (id, data) {
      data.updatedAt = new Date().toISOString();
      data.avatar = gravatar.url(data.email);
      const [updated] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      log.debug(updated, `Updated user by id ${id}`);
      return updated;
    },
  };
}
