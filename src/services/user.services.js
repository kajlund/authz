import { eq } from 'drizzle-orm';

import db from '../db/index.js';
import { usersTable } from '../db/schemas.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import { getAuthUtils } from '../utils/auth.utils.js';

function getDAO(log) {
  return {
    addUser: async function (data) {
      const [newUser] = await db.insert(usersTable).values(data).returning();
      log.debug(newUser, 'Created user');
      return newUser;
    },
    findUserByEmail: async function (email) {
      const [found] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      return found;
    },
    findUserById: async function (id) {
      const [found] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
      return found;
    },
    queryUsers: async function () {
      const users = await db
        .select({ id: usersTable.id, alias: usersTable.alias, email: usersTable.email, role: usersTable.role })
        .from(usersTable);
      return users;
    },
  };
}

export function getUserServices(cnf, log) {
  const dao = getDAO(log);
  const auth = getAuthUtils(cnf, log);

  return {
    loginUser: async function (loginData) {
      const { email, password } = loginData;
      // verify that user exists
      const user = await dao.findUserByEmail(email);
      if (!user) throw new UnauthorizedError('Invalid credentials');
      // Verify pwd
      if (!auth.comparePasswords(user.password, password)) throw new UnauthorizedError('Invalid credentials');

      // Password matched. Create session
      const accessToken = auth.generateAccessToken(user);
      const refreshToken = auth.generateRefreshToken(user.id);
      return {
        accessToken,
        refreshToken,
      };
    },

    signupUser: async function (userData) {
      const { alias, avatar, email, password } = userData;
      // verify that email not exist
      const user = await dao.findUserByEmail(email);
      if (user) throw new BadRequestError(`email ${email} is already registered`);
      // User does not exist create new
      const hashedPwd = await auth.generatePasswordHash(password);
      const addedUser = await dao.addUser({ alias, email, avatar, password: hashedPwd });
      const userObj = {
        id: addedUser.id,
        alias: addedUser.alias,
        email: addedUser.email,
        avatar: addedUser.avatar,
        role: addedUser.role,
      };
      const accessToken = auth.generateAccessToken(userObj);
      const refreshToken = auth.generateRefreshToken(userObj.id);
      return {
        accessToken,
        refreshToken,
      };
    },

    listUsers: async function () {
      const data = await dao.queryUsers();
      return data;
    },
  };
}
